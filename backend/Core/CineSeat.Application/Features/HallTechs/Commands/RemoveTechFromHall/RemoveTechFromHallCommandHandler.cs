using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.HallTechs.Commands.RemoveTechFromHall;

public class RemoveTechFromHallCommandHandler : IRequestHandler<RemoveTechFromHallCommand, Unit>
{
    private readonly IHallTechWriteRepository _write;

    public RemoveTechFromHallCommandHandler(IHallTechWriteRepository write) => _write = write;

    public async Task<Unit> Handle(RemoveTechFromHallCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.HardDeleteAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Salon-Teknoloji ataması", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
