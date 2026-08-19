using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovieById;

public class GetMovieByIdQueryHandler : IRequestHandler<GetMovieByIdQuery, MovieDto>
{
    private readonly IMovieReadRepository _read;

    public GetMovieByIdQueryHandler(IMovieReadRepository read) => _read = read;

    public async Task<MovieDto> Handle(GetMovieByIdQuery request, CancellationToken cancellationToken)
    {
        var movie = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.Id);

        return new MovieDto
        {
            Id = movie.Id,
            Title = movie.Title,
            Duration = movie.Duration,
            Description = movie.Description,
            AgeLimit = movie.AgeLimit,
            Language = movie.Language,
            Poster = movie.Poster,
            StartDate = movie.StartDate,
            EndDate = movie.EndDate,
            AvgScore = movie.AvgScore
        };
    }
}
