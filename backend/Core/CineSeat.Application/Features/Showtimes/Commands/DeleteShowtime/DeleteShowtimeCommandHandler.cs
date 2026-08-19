using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.DeleteShowtime;

public class DeleteShowtimeCommandHandler : IRequestHandler<DeleteShowtimeCommand, Unit>
{
    private readonly IShowtimeWriteRepository _write;

    public DeleteShowtimeCommandHandler(IShowtimeWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteShowtimeCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Seans", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
