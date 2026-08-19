using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.CreateHall;

public class CreateHallCommandHandler : IRequestHandler<CreateHallCommand, long>
{
    private readonly IHallWriteRepository _write;
    private readonly ICinemaReadRepository _cinemaRead;

    public CreateHallCommandHandler(IHallWriteRepository write, ICinemaReadRepository cinemaRead)
    {
        _write = write;
        _cinemaRead = cinemaRead;
    }

    public async Task<long> Handle(CreateHallCommand request, CancellationToken cancellationToken)
    {
        var cinema = await _cinemaRead.GetByIdAsync(request.CinemaId, tracking: false, cancellationToken);
        if (cinema is null)
            throw new NotFoundException("Sinema", request.CinemaId);

        var hall = new Hall
        {
            Name = request.Name,
            CinemaId = request.CinemaId
        };

        await _write.AddAsync(hall, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return hall.Id;
    }
}
