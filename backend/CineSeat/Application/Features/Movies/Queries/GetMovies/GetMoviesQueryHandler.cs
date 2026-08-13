using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Application.Features.Movies.Queries.GetMovies
{
    public class GetMoviesQueryHandler
        : IRequestHandler<GetMoviesQuery, Result<PagedResult<MovieDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetMoviesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<MovieDto>>> Handle(
            GetMoviesQuery request,
            CancellationToken cancellationToken)
        {
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize is < 1 or > 100 ? 10 : request.PageSize;

            // AsNoTracking: okuma tarafında change tracker'a gerek yok, daha hızlı.
            // IsDeleted filtresi burada YOK — global query filter otomatik ekliyor.
            var query = _context.Movies.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim();
                query = query.Where(m => EF.Functions.ILike(m.Title, $"%{search}%"));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(m => m.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                // Projeksiyon: entity değil, doğrudan DTO seçiliyor.
                // EF sadece bu kolonları SELECT eder.
                .Select(m => new MovieDto(
                    m.Id,
                    m.Title,
                    m.Duration,
                    m.Description,
                    m.AgeLimit,
                    m.Language,
                    m.Poster,
                    m.StartDate,
                    m.EndDate,
                    m.AvgScore))
                .ToListAsync(cancellationToken);

            return Result<PagedResult<MovieDto>>.Success(
                new PagedResult<MovieDto>(items, totalCount, page, pageSize));
        }
    }
}
