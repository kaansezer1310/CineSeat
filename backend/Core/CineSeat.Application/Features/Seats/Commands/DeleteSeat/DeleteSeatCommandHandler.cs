using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.DeleteSeat;

public class DeleteSeatCommandHandler : IRequestHandler<DeleteSeatCommand, Unit>
{
    private readonly ISeatWriteRepository _write;

    public DeleteSeatCommandHandler(ISeatWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteSeatCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Koltuk", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
