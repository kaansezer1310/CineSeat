using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.UserFavorites.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Queries.GetMyFavorites;

public class GetMyFavoritesQueryHandler
    : IRequestHandler<GetMyFavoritesQuery, PagedResult<FavoriteMovieDto>>
{
    private readonly IUserFavoriteReadRepository _read;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetMyFavoritesQueryHandler(
        IUserFavoriteReadRepository read,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<PagedResult<FavoriteMovieDto>> Handle(
        GetMyFavoritesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var page = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;

        var query = _read.GetWhere(f => f.UserId == userId, tracking: false);

        var totalCount = await _queryExecutor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new FavoriteMovieDto
            {
                MovieId = f.MovieId,
                Title = f.Movie.Title,
                Poster = f.Movie.Poster,
                AvgScore = f.Movie.AvgScore,
                AddedAt = f.CreatedAt
            });

        var items = await _queryExecutor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<FavoriteMovieDto>(items, totalCount, page, pageSize);
    }
}
