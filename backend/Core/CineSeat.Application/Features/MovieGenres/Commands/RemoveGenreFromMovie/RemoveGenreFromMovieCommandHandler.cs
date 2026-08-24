using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Commands.RemoveGenreFromMovie;

public class RemoveGenreFromMovieCommandHandler : IRequestHandler<RemoveGenreFromMovieCommand, Unit>
{
    private readonly IMovieGenreReadRepository _read;
    private readonly IMovieGenreWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public RemoveGenreFromMovieCommandHandler(
        IMovieGenreReadRepository read,
        IMovieGenreWriteRepository write,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(RemoveGenreFromMovieCommand request, CancellationToken cancellationToken)
    {
        // Bağlı tablo: id ile değil, (MovieId, GenreId) çifti ile bulunur.
        var movieGenre = await _queryExecutor.FirstOrDefaultAsync(
            _read.GetWhere(mg => mg.MovieId == request.MovieId && mg.GenreId == request.GenreId, tracking: true),
            cancellationToken);

        if (movieGenre is null)
            throw new NotFoundException("Film-tür eşleşmesi", $"film:{request.MovieId}, tür:{request.GenreId}");

        _write.HardDelete(movieGenre);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
