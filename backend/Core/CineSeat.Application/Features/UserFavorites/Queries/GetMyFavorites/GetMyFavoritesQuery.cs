using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.UserFavorites.DTOs;
using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Queries.GetMyFavorites;

public class GetMyFavoritesQuery : IRequest<PagedResult<FavoriteMovieDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
