using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Comments.Common;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Comments.Commands.AddComment;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, long>
{
    private readonly ICommentReadRepository _read;
    private readonly ICommentWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IMovieWriteRepository _movieWrite;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public AddCommentCommandHandler(
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

    public async Task<long> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var movie = await _movieRead.GetByIdAsync(request.MovieId, tracking: true, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.MovieId);

        // Bir kullanıcı bir filme tek yorum yazabilir; aksi halde puan ortalaması
        // tekrar tekrar yorum yazılarak manipüle edilebilirdi.
        var alreadyCommented = await _queryExecutor.AnyAsync(
            _read.GetWhere(c => c.MovieId == request.MovieId && c.UserId == userId, tracking: false),
            cancellationToken);
        if (alreadyCommented)
            throw new ConflictException("Bu filme zaten yorum yaptınız.");

        var comment = new Comment
        {
            MovieId = request.MovieId,
            UserId = userId,
            Rating = request.Rating,
            Content = request.Content?.Trim() ?? string.Empty,
            IsEdited = false
        };

        await _write.AddAsync(comment, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        // Yeni yorum kaydedildikten SONRA hesaplanıyor ki ortalamaya dahil olsun.
        movie.AvgScore = await MovieScoreCalculator.CalculateAsync(
            _read, _queryExecutor, request.MovieId, cancellationToken);

        _movieWrite.Update(movie);
        await _movieWrite.SaveAsync(cancellationToken);

        return comment.Id;
    }
}
