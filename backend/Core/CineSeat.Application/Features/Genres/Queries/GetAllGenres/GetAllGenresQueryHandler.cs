using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Genres.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Genres.Queries.GetAllGenres;

public class GetAllGenresQueryHandler : IRequestHandler<GetAllGenresQuery, List<GenreDto>>
{
    private readonly IGenreReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetAllGenresQueryHandler(IGenreReadRepository read, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<List<GenreDto>> Handle(GetAllGenresQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false)
            .OrderBy(g => g.Name)
            .Select(g => new GenreDto { Id = g.Id, Name = g.Name });

        return await _queryExecutor.ToListAsync(query, cancellationToken);
    }
}
