using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.CreateGenre;

public class CreateGenreCommandHandler : IRequestHandler<CreateGenreCommand, long>
{
    private readonly IGenreReadRepository _read;
    private readonly IGenreWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public CreateGenreCommandHandler(
        IGenreReadRepository read, IGenreWriteRepository write, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<long> Handle(CreateGenreCommand request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();

        // Genre.Name üzerinde DB'de unique index var; oraya düşmeden anlamlı 409 dönüyoruz.
        var exists = await _queryExecutor.AnyAsync(
            _read.GetWhere(g => g.Name.ToLower() == name.ToLower(), tracking: false), cancellationToken);
        if (exists)
            throw new ConflictException($"'{name}' türü zaten kayıtlı.");

        var genre = new Genre { Name = name };

        await _write.AddAsync(genre, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return genre.Id;
    }
}
