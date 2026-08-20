using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Commands.AddFavorite;

public class AddFavoriteCommandHandler : IRequestHandler<AddFavoriteCommand, long>
{
    private readonly IUserFavoriteReadRepository _read;
    private readonly IUserFavoriteWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public AddFavoriteCommandHandler(
        IUserFavoriteReadRepository read,
        IUserFavoriteWriteRepository write,
        IMovieReadRepository movieRead,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _movieRead = movieRead;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<long> Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var movie = await _movieRead.GetByIdAsync(request.MovieId, tracking: false, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.MovieId);

        // (UserId, MovieId) DB'de unique — aynı filmi iki kez favorilemek 409 döner.
        var alreadyFavorite = await _queryExecutor.AnyAsync(
            _read.GetWhere(f => f.UserId == userId && f.MovieId == request.MovieId, tracking: false),
            cancellationToken);
        if (alreadyFavorite)
            throw new ConflictException("Bu film zaten favorilerinizde.");

        var favorite = new UserFavorite { UserId = userId, MovieId = request.MovieId };

        await _write.AddAsync(favorite, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return favorite.Id;
    }
}
