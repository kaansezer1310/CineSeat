using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.CreateSeats;

public class CreateSeatsCommandHandler : IRequestHandler<CreateSeatsCommand, int>
{
    private readonly ISeatReadRepository _read;
    private readonly ISeatWriteRepository _write;
    private readonly IHallReadRepository _hallRead;

    public CreateSeatsCommandHandler(
        ISeatReadRepository read,
        ISeatWriteRepository write,
        IHallReadRepository hallRead)
    {
        _read = read;
        _write = write;
        _hallRead = hallRead;
    }

    public async Task<int> Handle(CreateSeatsCommand request, CancellationToken cancellationToken)
    {
        var hall = await _hallRead.GetByIdAsync(request.HallId, tracking: false, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.HallId);

        // Salonda zaten var olan koltukların (satır, sütun) çiftlerini topla — tekrar oluşturma.
        var existing = _read.GetWhere(s => s.HallId == request.HallId, tracking: false);
        var existingPairs = existing
            .Select(s => new { s.SeatRow, s.SeatColumn })
            .AsEnumerable()
            .Select(p => (p.SeatRow, p.SeatColumn))
            .ToHashSet();

        var newSeats = new List<Seat>();
        for (short row = 1; row <= request.RowCount; row++)
        {
            for (short col = 1; col <= request.ColumnCount; col++)
            {
                if (existingPairs.Contains((row, col)))
                    continue;

                newSeats.Add(new Seat
                {
                    HallId = request.HallId,
                    SeatRow = row,
                    SeatColumn = col,
                    Type = request.DefaultType,
                    IsActive = true
                });
            }
        }

        if (newSeats.Count == 0)
            return 0;

        await _write.AddRangeAsync(newSeats, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return newSeats.Count;
    }
}
