using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Commands.AssignGenreToMovie;

public class AssignGenreToMovieCommandHandler : IRequestHandler<AssignGenreToMovieCommand, long>
{
    private readonly IMovieGenreReadRepository _read;
    private readonly IMovieGenreWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IGenreReadRepository _genreRead;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public AssignGenreToMovieCommandHandler(
        IMovieGenreReadRepository read,
        IMovieGenreWriteRepository write,
        IMovieReadRepository movieRead,
        IGenreReadRepository genreRead,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _movieRead = movieRead;
        _genreRead = genreRead;
        _queryExecutor = queryExecutor;
    }

    public async Task<long> Handle(AssignGenreToMovieCommand request, CancellationToken cancellationToken)
    {
        var movie = await _movieRead.GetByIdAsync(request.MovieId, tracking: false, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.MovieId);

        var genre = await _genreRead.GetByIdAsync(request.GenreId, tracking: false, cancellationToken);
        if (genre is null)
            throw new NotFoundException("Tür", request.GenreId);

        // (MovieId, GenreId) DB'de unique; aynı türü iki kez atamak 409 döner.
        var alreadyAssigned = await _queryExecutor.AnyAsync(
            _read.GetWhere(mg => mg.MovieId == request.MovieId && mg.GenreId == request.GenreId, tracking: false),
            cancellationToken);
        if (alreadyAssigned)
            throw new ConflictException("Bu tür filme zaten atanmış.");

        var movieGenre = new MovieGenre { MovieId = request.MovieId, GenreId = request.GenreId };

        await _write.AddAsync(movieGenre, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return movieGenre.Id;
    }
}
