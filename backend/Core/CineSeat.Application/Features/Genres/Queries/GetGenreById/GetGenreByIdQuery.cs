using CineSeat.Application.Features.Genres.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Genres.Queries.GetGenreById;

public class GetGenreByIdQuery : IRequest<GenreDto>
{
    public long Id { get; set; }
}
