using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Commands.RemoveFavorite;

public class RemoveFavoriteCommand : IRequest<Unit>
{
    public long MovieId { get; set; }
}
