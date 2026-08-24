using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovieById;

public class GetMovieByIdQueryHandler : IRequestHandler<GetMovieByIdQuery, MovieDto>
{
    private readonly IMovieReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetMovieByIdQueryHandler(
        IMovieReadRepository read,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<MovieDto> Handle(GetMovieByIdQuery request, CancellationToken cancellationToken)
    {
        var movie = await _queryExecutor.FirstOrDefaultAsync(
            _read
                .GetWhere(movie => movie.Id == request.Id, tracking: false)
                .Select(movie => new MovieDto
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
                    AvgScore = movie.AvgScore,
                    Genres = movie.MovieGenres
                        .Select(movieGenre => movieGenre.Genre.Name)
                        .OrderBy(genre => genre)
                        .ToList()
                }),
            cancellationToken);

        if (movie is null)
            throw new NotFoundException("Film", request.Id);

        return movie;
    }
}
