using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovies;

public class GetMoviesQueryHandler : IRequestHandler<GetMoviesQuery, PagedResult<MovieDto>>
{
    private readonly IMovieReadRepository _movieReadRepository;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetMoviesQueryHandler(
        IMovieReadRepository movieReadRepository,
        IAsyncQueryExecutor queryExecutor)
    {
        _movieReadRepository = movieReadRepository;
        _queryExecutor = queryExecutor;
    }

    public async Task<PagedResult<MovieDto>> Handle(
        GetMoviesQuery request,
        CancellationToken cancellationToken)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 10 : request.PageSize;

        // tracking: false → okuma tarafında change tracker'a gerek yok, daha hızlı.
        // IsDeleted filtresi burada YOK — global query filter otomatik ekliyor.
        var query = _movieReadRepository.GetAll(tracking: false);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            // Npgsql'e özel EF.Functions.ILike BİLEREK kullanılmadı: o metot
            // Npgsql paketinde yaşar ve Application katmanının veritabanı
            // sağlayıcısını tanımaması gerekir. ToLower().Contains() her
            // sağlayıcıda çalışır ve PostgreSQL'de "lower(title) LIKE" üretir.
            var search = request.Search.Trim().ToLower();
            query = query.Where(m => m.Title.ToLower().Contains(search));
        }

        var totalCount = await _queryExecutor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderByDescending(m => m.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            // Projeksiyon: entity değil, doğrudan DTO seçiliyor.
            // EF sadece bu kolonları SELECT eder.
            .Select(m => new MovieDto
            {
                Id = m.Id,
                Title = m.Title,
                Duration = m.Duration,
                Description = m.Description,
                AgeLimit = m.AgeLimit,
                Language = m.Language,
                Poster = m.Poster,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                AvgScore = m.AvgScore,
                Genres = m.MovieGenres
                    .Select(movieGenre => movieGenre.Genre.Name)
                    .OrderBy(genre => genre)
                    .ToList()
            });

        var items = await _queryExecutor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<MovieDto>(items, totalCount, page, pageSize);
    }
}
