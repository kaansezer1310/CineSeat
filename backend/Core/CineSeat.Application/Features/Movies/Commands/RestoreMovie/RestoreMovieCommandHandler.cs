using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.RestoreMovie;

public class RestoreMovieCommandHandler : IRequestHandler<RestoreMovieCommand, Unit>
{
    private readonly IMovieWriteRepository _write;

    public RestoreMovieCommandHandler(IMovieWriteRepository write) => _write = write;

    public async Task<Unit> Handle(RestoreMovieCommand request, CancellationToken cancellationToken)
    {
        var restored = await _write.RestoreAsync(request.Id, cancellationToken);
        if (!restored)
            throw new NotFoundException("Arşivlenmiş film", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
