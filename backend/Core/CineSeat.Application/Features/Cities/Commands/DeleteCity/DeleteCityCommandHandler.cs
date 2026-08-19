using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cities.Commands.DeleteCity;

public class DeleteCityCommandHandler : IRequestHandler<DeleteCityCommand, Unit>
{
    private readonly ICityWriteRepository _write;

    public DeleteCityCommandHandler(ICityWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteCityCommand request, CancellationToken cancellationToken)
    {
        // RemoveAsync kaydı bulup siler; bulamazsa false döner.
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Şehir", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
