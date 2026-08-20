using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Commands.DeleteCinema;

public class DeleteCinemaCommandHandler : IRequestHandler<DeleteCinemaCommand, Unit>
{
    private readonly ICinemaWriteRepository _write;

    public DeleteCinemaCommandHandler(ICinemaWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteCinemaCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Sinema", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
