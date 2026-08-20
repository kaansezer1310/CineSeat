using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.CreateTechnology;

public class CreateTechnologyCommandHandler : IRequestHandler<CreateTechnologyCommand, long>
{
    private readonly ITechnologyWriteRepository _write;

    public CreateTechnologyCommandHandler(ITechnologyWriteRepository write) => _write = write;

    public async Task<long> Handle(CreateTechnologyCommand request, CancellationToken cancellationToken)
    {
        var technology = new Technology { Name = request.Name };

        await _write.AddAsync(technology, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return technology.Id;
    }
}
