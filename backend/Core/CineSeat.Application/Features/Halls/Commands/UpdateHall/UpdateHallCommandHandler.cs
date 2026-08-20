using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.UpdateHall;

public class UpdateHallCommandHandler : IRequestHandler<UpdateHallCommand, Unit>
{
    private readonly IHallReadRepository _read;
    private readonly IHallWriteRepository _write;
    private readonly ICinemaReadRepository _cinemaRead;

    public UpdateHallCommandHandler(
        IHallReadRepository read,
        IHallWriteRepository write,
        ICinemaReadRepository cinemaRead)
    {
        _read = read;
        _write = write;
        _cinemaRead = cinemaRead;
    }

    public async Task<Unit> Handle(UpdateHallCommand request, CancellationToken cancellationToken)
    {
        var hall = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.Id);

        var cinema = await _cinemaRead.GetByIdAsync(request.CinemaId, tracking: false, cancellationToken);
        if (cinema is null)
            throw new NotFoundException("Sinema", request.CinemaId);

        hall.Name = request.Name;
        hall.CinemaId = request.CinemaId;

        _write.Update(hall);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
