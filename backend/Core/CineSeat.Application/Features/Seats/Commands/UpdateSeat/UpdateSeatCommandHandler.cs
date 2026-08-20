using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.UpdateSeat;

public class UpdateSeatCommandHandler : IRequestHandler<UpdateSeatCommand, Unit>
{
    private readonly ISeatReadRepository _read;
    private readonly ISeatWriteRepository _write;

    public UpdateSeatCommandHandler(ISeatReadRepository read, ISeatWriteRepository write)
    {
        _read = read;
        _write = write;
    }

    public async Task<Unit> Handle(UpdateSeatCommand request, CancellationToken cancellationToken)
    {
        var seat = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (seat is null)
            throw new NotFoundException("Koltuk", request.Id);

        seat.Type = request.Type;
        seat.IsActive = request.IsActive;

        _write.Update(seat);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
