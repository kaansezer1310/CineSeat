using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;

public class ReleaseSeatCommandHandler : IRequestHandler<ReleaseSeatCommand, Unit>
{
    private readonly ISeatLockWriteRepository _write;

    public ReleaseSeatCommandHandler(ISeatLockWriteRepository write) => _write = write;

    public async Task<Unit> Handle(ReleaseSeatCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Koltuk kilidi", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
