using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.DeleteHall;

public class DeleteHallCommandHandler : IRequestHandler<DeleteHallCommand, Unit>
{
    private readonly IHallWriteRepository _write;

    public DeleteHallCommandHandler(IHallWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteHallCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Salon", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
