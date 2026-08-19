using CineSeat.Application.Features.Movies.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovieById;

public class GetMovieByIdQuery : IRequest<MovieDto>
{
    public long Id { get; set; }
}
