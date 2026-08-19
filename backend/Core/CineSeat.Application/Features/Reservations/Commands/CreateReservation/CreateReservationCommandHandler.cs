using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CreateReservation;

// Rezervasyon oluşturma akışı — TEK SaveChanges (transaction) içinde:
//  1) Seans + her koltuk var mı ve seansın salonuna mı ait — doğrula.
//  2) İstekte mükerrer koltuk var mı — reddet.
//  3) Koltuklardan biri zaten (iptal edilmemiş) rezerve mi — reddet.
//  4) Koltuklardan biri BAŞKA bir kullanıcı tarafından (süresi dolmamış) kilitli mi — reddet.
//  5) Fiyat: seans.BasePrice × bilet-tipi çarpanı (bkz. TicketTypeMultiplier — domain'de
//     resmi bir kural yok, bu bir varsayımdır, netleştirilmesi gerekebilir).
//  6) Kampanya indirimi: kampanya aktif mi + sepet MinCartTotal'i geçiyor mu doğrulanır,
//     Percentage/FixedAmount tipine göre hesaplanır ve indirim asla ara toplamı aşamaz.
//  7) Reservation + Ticket'lar aynı DbContext'te (scoped) eklenir, TEK SaveAsync ile kaydedilir.
//  8) Koltuğa ait varsa SeatLock satırı(ları) aynı SaveChanges içinde silinir.
public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IReservationWriteRepository _reservationWrite;
    private readonly ITicketWriteRepository _ticketWrite;
    private readonly ITicketReadRepository _ticketRead;
    private readonly ISeatLockReadRepository _seatLockRead;
    private readonly ISeatLockWriteRepository _seatLockWrite;
    private readonly IShowtimeReadRepository _showtimeRead;
    private readonly ISeatReadRepository _seatRead;
    private readonly IUserReadRepository _userRead;
    private readonly ICampaignReadRepository _campaignRead;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _executor;

    public CreateReservationCommandHandler(
        IReservationWriteRepository reservationWrite,
        ITicketWriteRepository ticketWrite,
        ITicketReadRepository ticketRead,
        ISeatLockReadRepository seatLockRead,
        ISeatLockWriteRepository seatLockWrite,
        IShowtimeReadRepository showtimeRead,
        ISeatReadRepository seatRead,
        IUserReadRepository userRead,
        ICampaignReadRepository campaignRead,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor executor)
    {
        _reservationWrite = reservationWrite;
        _ticketWrite = ticketWrite;
        _ticketRead = ticketRead;
        _seatLockRead = seatLockRead;
        _seatLockWrite = seatLockWrite;
        _showtimeRead = showtimeRead;
        _seatRead = seatRead;
        _userRead = userRead;
        _campaignRead = campaignRead;
        _currentUser = currentUser;
        _executor = executor;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        // Token geçerli ama kullanıcı silinmiş olabilir — FK ihlaline düşmeden 404 dön.
        var user = await _userRead.GetByIdAsync(userId, tracking: false, cancellationToken);
        if (user is null)
            throw new NotFoundException("Kullanıcı", userId);

        var showtime = await _showtimeRead.GetByIdAsync(request.ShowtimeId, tracking: false, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.ShowtimeId);

        var seatIds = request.Seats.Select(s => s.SeatId).ToList();
        if (seatIds.Distinct().Count() != seatIds.Count)
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.Seats), "Aynı koltuk birden fazla kez seçilemez.")
            });

        foreach (var seatId in seatIds)
        {
            var seat = await _seatRead.GetByIdAsync(seatId, tracking: false, cancellationToken);
            if (seat is null)
                throw new NotFoundException("Koltuk", seatId);
            if (seat.HallId != showtime.HallId)
                throw new ValidationException(new[]
                {
                    new FluentValidation.Results.ValidationFailure(
                        nameof(request.Seats), $"Koltuk {seatId} seçilen seansın salonuna ait değil.")
                });
        }

        var bookedSeatIds = await _executor.ToListAsync(
            _ticketRead.GetWhere(
                    t => seatIds.Contains(t.SeatId)
                         && t.Reservation.ShowtimeId == request.ShowtimeId
                         && t.Reservation.Status != ReservationStatus.Cancelled,
                    tracking: false)
                .Select(t => t.SeatId),
            cancellationToken);
        if (bookedSeatIds.Count > 0)
            throw new ConflictException(
                $"Şu koltuklar bu seans için zaten rezerve edilmiş: {string.Join(", ", bookedSeatIds)}");

        var now = DateTimeOffset.UtcNow;
        var conflictingLocks = await _executor.ToListAsync(
            _seatLockRead.GetWhere(
                    sl => sl.ShowtimeId == request.ShowtimeId
                          && seatIds.Contains(sl.SeatId)
                          && sl.UserId != userId
                          && sl.LockExpiresAt > now,
                    tracking: false)
                .Select(sl => sl.SeatId),
            cancellationToken);
        if (conflictingLocks.Count > 0)
            throw new ConflictException(
                $"Şu koltuklar başka bir kullanıcı tarafından kilitli: {string.Join(", ", conflictingLocks)}");

        decimal subtotal = 0;
        var tickets = new List<Ticket>();
        foreach (var item in request.Seats)
        {
            var price = Math.Round(showtime.BasePrice * TicketTypeMultiplier(item.TicketType), 2);
            subtotal += price;
            tickets.Add(new Ticket
            {
                SeatId = item.SeatId,
                TicketType = item.TicketType,
                Price = price
            });
        }

        var discount = await CalculateDiscountAsync(request.CampaignId, subtotal, cancellationToken);
        var total = subtotal - discount;

        var reservation = new Reservation
        {
            ResNo = GenerateResNo(),
            UserId = userId,
            ShowtimeId = request.ShowtimeId,
            CampaignId = request.CampaignId,
            BuyerFname = request.BuyerFname,
            BuyerLname = request.BuyerLname,
            BuyerEmail = request.BuyerEmail,
            Subtotal = subtotal,
            Discount = discount,
            Total = total,
            Status = ReservationStatus.Completed
        };

        foreach (var ticket in tickets)
            ticket.Reservation = reservation; // navigation fixup — EF, Id oluşunca FK'yı otomatik set eder

        await _reservationWrite.AddAsync(reservation, cancellationToken);
        await _ticketWrite.AddRangeAsync(tickets, cancellationToken);

        // Bu koltuklara ait varsa kilit satırlarını da aynı transaction'da temizle.
        var locksToClear = await _executor.ToListAsync(
            _seatLockRead.GetWhere(
                sl => sl.ShowtimeId == request.ShowtimeId && seatIds.Contains(sl.SeatId),
                tracking: true),
            cancellationToken);
        if (locksToClear.Count > 0)
            _seatLockWrite.RemoveRange(locksToClear);

        // Tek SaveChanges — reservation + tickets + kilit temizliği aynı transaction'da.
        await _reservationWrite.SaveAsync(cancellationToken);

        return new ReservationDto
        {
            Id = reservation.Id,
            ResNo = reservation.ResNo,
            ShowtimeId = reservation.ShowtimeId,
            CampaignId = reservation.CampaignId,
            BuyerFname = reservation.BuyerFname,
            BuyerLname = reservation.BuyerLname,
            BuyerEmail = reservation.BuyerEmail,
            Subtotal = reservation.Subtotal,
            Discount = reservation.Discount,
            Total = reservation.Total,
            Status = reservation.Status,
            Tickets = tickets.Select(t => new TicketDto
            {
                Id = t.Id,
                ReservationId = t.ReservationId,
                SeatId = t.SeatId,
                TicketType = t.TicketType,
                Price = t.Price
            }).ToList()
        };
    }

    /// <summary>
    /// Kampanya indirimini hesaplar. CampaignId verilmemişse 0 döner.
    /// İndirim ara toplamı asla aşamaz — aşsaydı Total negatife düşerdi.
    /// </summary>
    private async Task<decimal> CalculateDiscountAsync(
        long? campaignId, decimal subtotal, CancellationToken cancellationToken)
    {
        if (campaignId is null)
            return 0m;

        var campaign = await _campaignRead.GetByIdAsync(campaignId.Value, tracking: false, cancellationToken);
        if (campaign is null)
            throw new NotFoundException("Kampanya", campaignId.Value);

        if (!campaign.IsActive)
            throw new ConflictException("Bu kampanya aktif değil.");

        // MembersOnly ayrıca kontrol edilmiyor: rezervasyon zaten giriş yapmış
        // kullanıcı gerektiriyor, yani buraya gelen herkes üye.

        if (subtotal < campaign.MinCartTotal)
            throw new ConflictException(
                $"Bu kampanya için sepet tutarı en az {campaign.MinCartTotal:0.00} olmalıdır.");

        var raw = campaign.Type switch
        {
            CampaignType.Percentage => Math.Round(subtotal * campaign.Value / 100m, 2),
            CampaignType.FixedAmount => campaign.Value,
            _ => 0m
        };

        return Math.Min(raw, subtotal);
    }

    // Domain'de resmi bir bilet-tipi fiyat kuralı tanımlı değil; bu makul bir varsayımdır.
    private static decimal TicketTypeMultiplier(TicketType type) => type switch
    {
        TicketType.Adult => 1.0m,
        TicketType.Student => 0.75m,
        TicketType.Child => 0.5m,
        _ => 1.0m
    };

    private static string GenerateResNo()
        => $"RES-{Guid.NewGuid():N}".Substring(0, 14).ToUpperInvariant();
}
