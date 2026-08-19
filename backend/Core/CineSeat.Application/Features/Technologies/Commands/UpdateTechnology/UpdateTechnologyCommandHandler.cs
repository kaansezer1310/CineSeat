using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.UpdateTechnology;

public class UpdateTechnologyCommandHandler : IRequestHandler<UpdateTechnologyCommand, Unit>
{
    private readonly ITechnologyReadRepository _read;
    private readonly ITechnologyWriteRepository _write;

    public UpdateTechnologyCommandHandler(ITechnologyReadRepository read, ITechnologyWriteRepository write)
    {
        _read = read;
        _write = write;
    }

    public async Task<Unit> Handle(UpdateTechnologyCommand request, CancellationToken cancellationToken)
    {
        var technology = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (technology is null)
            throw new NotFoundException("Teknoloji", request.Id);

        technology.Name = request.Name;

        _write.Update(technology);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
