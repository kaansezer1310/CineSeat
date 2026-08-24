using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Commands.RemoveFavorite;

public class RemoveFavoriteCommandHandler : IRequestHandler<RemoveFavoriteCommand, Unit>
{
    private readonly IUserFavoriteReadRepository _read;
    private readonly IUserFavoriteWriteRepository _write;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public RemoveFavoriteCommandHandler(
        IUserFavoriteReadRepository read,
        IUserFavoriteWriteRepository write,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        // Filtreye UserId dahil: başkasının favori kaydı id ile bile silinemez.
        var favorite = await _queryExecutor.FirstOrDefaultAsync(
            _read.GetWhere(f => f.UserId == userId && f.MovieId == request.MovieId, tracking: true),
            cancellationToken);

        if (favorite is null)
            throw new NotFoundException("Favori", request.MovieId);

        _write.HardDelete(favorite);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
