using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetArchivedMovies;

public class GetArchivedMoviesQueryHandler
    : IRequestHandler<GetArchivedMoviesQuery, PagedResult<MovieDto>>
{
    private readonly IMovieReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetArchivedMoviesQueryHandler(
        IMovieReadRepository read,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<PagedResult<MovieDto>> Handle(
        GetArchivedMoviesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _read
            .GetAllIncludingDeleted(tracking: false)
            .Where(movie => movie.IsDeleted);

        var totalCount = await _queryExecutor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderByDescending(movie => movie.UpdatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
                    .Where(movieGenre => !movieGenre.IsDeleted && !movieGenre.Genre.IsDeleted)
                    .Select(movieGenre => movieGenre.Genre.Name)
                    .OrderBy(genre => genre)
                    .ToList()
            });

        var items = await _queryExecutor.ToListAsync(pageQuery, cancellationToken);
        return new PagedResult<MovieDto>(
            items,
            totalCount,
            request.Page,
            request.PageSize);
    }
}
