using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.HallTechs.Commands.AssignTechToHall;

public class AssignTechToHallCommandHandler : IRequestHandler<AssignTechToHallCommand, long>
{
    private readonly IHallTechReadRepository _read;
    private readonly IHallTechWriteRepository _write;
    private readonly IHallReadRepository _hallRead;
    private readonly ITechnologyReadRepository _technologyRead;

    public AssignTechToHallCommandHandler(
        IHallTechReadRepository read,
        IHallTechWriteRepository write,
        IHallReadRepository hallRead,
        ITechnologyReadRepository technologyRead)
    {
        _read = read;
        _write = write;
        _hallRead = hallRead;
        _technologyRead = technologyRead;
    }

    public async Task<long> Handle(AssignTechToHallCommand request, CancellationToken cancellationToken)
    {
        var hall = await _hallRead.GetByIdAsync(request.HallId, tracking: false, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.HallId);

        var technology = await _technologyRead.GetByIdAsync(request.TechnologyId, tracking: false, cancellationToken);
        if (technology is null)
            throw new NotFoundException("Teknoloji", request.TechnologyId);

        // DB'de unique constraint yok; mükerrer atamayı burada engelliyoruz.
        var alreadyAssigned = await _read.GetSingleAsync(
            ht => ht.HallId == request.HallId && ht.TechnologyId == request.TechnologyId,
            tracking: false,
            cancellationToken);
        if (alreadyAssigned is not null)
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.TechnologyId), "Bu teknoloji bu salona zaten atanmış.")
            });

        var hallTech = new HallTech
        {
            HallId = request.HallId,
            TechnologyId = request.TechnologyId
        };

        await _write.AddAsync(hallTech, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return hallTech.Id;
    }
}
