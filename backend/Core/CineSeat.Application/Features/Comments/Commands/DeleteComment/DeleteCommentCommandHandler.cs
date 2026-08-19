using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Comments.Common;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Comments.Commands.DeleteComment;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, Unit>
{
    private readonly ICommentReadRepository _read;
    private readonly ICommentWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IMovieWriteRepository _movieWrite;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public DeleteCommentCommandHandler(
        ICommentReadRepository read,
        ICommentWriteRepository write,
        IMovieReadRepository movieRead,
        IMovieWriteRepository movieWrite,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _movieRead = movieRead;
        _movieWrite = movieWrite;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var comment = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (comment is null)
            throw new NotFoundException("Yorum", request.Id);

        // Kendi yorumunu herkes silebilir; başkasınınkini yalnızca Admin (moderasyon).
        var isOwner = comment.UserId == userId;
        var isAdmin = _currentUser.Role == RoleNames.Admin;
        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Yalnızca kendi yorumunuzu silebilirsiniz.");

        var movieId = comment.MovieId;

        _write.Remove(comment);
        await _write.SaveAsync(cancellationToken);

        var movie = await _movieRead.GetByIdAsync(movieId, tracking: true, cancellationToken);
        if (movie is not null)
        {
            movie.AvgScore = await MovieScoreCalculator.CalculateAsync(
                _read, _queryExecutor, movieId, cancellationToken);

            _movieWrite.Update(movie);
            await _movieWrite.SaveAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
