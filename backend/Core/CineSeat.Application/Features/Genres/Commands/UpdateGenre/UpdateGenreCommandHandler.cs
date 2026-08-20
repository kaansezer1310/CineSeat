using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.UpdateGenre;

public class UpdateGenreCommandHandler : IRequestHandler<UpdateGenreCommand, Unit>
{
    private readonly IGenreReadRepository _read;
    private readonly IGenreWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public UpdateGenreCommandHandler(
        IGenreReadRepository read, IGenreWriteRepository write, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(UpdateGenreCommand request, CancellationToken cancellationToken)
    {
        var genre = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (genre is null)
            throw new NotFoundException("Tür", request.Id);

        var name = request.Name.Trim();

        var duplicate = await _queryExecutor.AnyAsync(
            _read.GetWhere(g => g.Id != request.Id && g.Name.ToLower() == name.ToLower(), tracking: false),
            cancellationToken);
        if (duplicate)
            throw new ConflictException($"'{name}' türü zaten kayıtlı.");

        genre.Name = name;

        _write.Update(genre);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
