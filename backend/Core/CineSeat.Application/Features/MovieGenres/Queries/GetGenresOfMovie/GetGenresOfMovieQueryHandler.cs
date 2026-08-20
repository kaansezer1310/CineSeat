using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Genres.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Queries.GetGenresOfMovie;

public class GetGenresOfMovieQueryHandler : IRequestHandler<GetGenresOfMovieQuery, List<GenreDto>>
{
    private readonly IMovieGenreReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetGenresOfMovieQueryHandler(IMovieGenreReadRepository read, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<List<GenreDto>> Handle(GetGenresOfMovieQuery request, CancellationToken cancellationToken)
    {
        // Include() bir EF metodu; bunun yerine navigation property üzerinden
        // projeksiyon yapıyoruz — EF bunu tek JOIN'e çevirir.
        var query = _read.GetWhere(mg => mg.MovieId == request.MovieId, tracking: false)
            .OrderBy(mg => mg.Genre.Name)
            .Select(mg => new GenreDto { Id = mg.GenreId, Name = mg.Genre.Name });

        return await _queryExecutor.ToListAsync(query, cancellationToken);
    }
}
