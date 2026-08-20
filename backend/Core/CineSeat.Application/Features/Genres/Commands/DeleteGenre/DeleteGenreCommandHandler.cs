using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.DeleteGenre;

public class DeleteGenreCommandHandler : IRequestHandler<DeleteGenreCommand, Unit>
{
    private readonly IGenreWriteRepository _write;
    private readonly IMovieGenreReadRepository _movieGenreRead;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public DeleteGenreCommandHandler(
        IGenreWriteRepository write,
        IMovieGenreReadRepository movieGenreRead,
        IAsyncQueryExecutor queryExecutor)
    {
        _write = write;
        _movieGenreRead = movieGenreRead;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(DeleteGenreCommand request, CancellationToken cancellationToken)
    {
        // Filme atanmış bir tür silinirse MovieGenre satırları FK ihlaline düşer.
        // Veritabanı hatası yerine anlaşılır bir 409 dönüyoruz.
        var inUse = await _queryExecutor.AnyAsync(
            _movieGenreRead.GetWhere(mg => mg.GenreId == request.Id, tracking: false), cancellationToken);
        if (inUse)
            throw new ConflictException("Bu tür bir veya daha fazla filme atanmış, önce atamaları kaldırın.");

        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Tür", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
