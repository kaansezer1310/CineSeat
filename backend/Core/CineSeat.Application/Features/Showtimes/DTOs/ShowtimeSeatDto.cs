using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Showtimes.DTOs;

/// <summary>
/// Koltuk haritasinin tek kaynagi: salonun koltuklari + o seanstaki durumu.
/// Istemcinin koltuk/kilit/bilet uclarini ayri ayri cagirip birlestirmesi
/// gerekmez; birlestirme sunucuda, tek sorguda yapilir.
/// </summary>
public class ShowtimeSeatDto
{
    public long SeatId { get; set; }
    public short SeatRow { get; set; }
    public short SeatColumn { get; set; }
    public SeatType Type { get; set; }
    public bool IsActive { get; set; }
    public ShowtimeSeatStatus Status { get; set; }

    /// <summary>
    /// Kilit cagiran kullaniciya aitse true. Kullanicinin kendi tuttugu
    /// koltuk arayuzde "baskasi aldi" gibi gorunmemeli.
    /// </summary>
    public bool LockedByCurrentUser { get; set; }
}
