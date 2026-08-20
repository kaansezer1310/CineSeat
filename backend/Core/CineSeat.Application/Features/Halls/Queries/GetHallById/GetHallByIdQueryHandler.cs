using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Halls.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Halls.Queries.GetHallById;

public class GetHallByIdQueryHandler : IRequestHandler<GetHallByIdQuery, HallDto>
{
    private readonly IHallReadRepository _read;

    public GetHallByIdQueryHandler(IHallReadRepository read) => _read = read;

    public async Task<HallDto> Handle(GetHallByIdQuery request, CancellationToken cancellationToken)
    {
        var hall = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.Id);

        return new HallDto { Id = hall.Id, Name = hall.Name, CinemaId = hall.CinemaId };
    }
}
