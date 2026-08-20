using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.DeleteTechnology;

public class DeleteTechnologyCommandHandler : IRequestHandler<DeleteTechnologyCommand, Unit>
{
    private readonly ITechnologyWriteRepository _write;

    public DeleteTechnologyCommandHandler(ITechnologyWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteTechnologyCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Teknoloji", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
