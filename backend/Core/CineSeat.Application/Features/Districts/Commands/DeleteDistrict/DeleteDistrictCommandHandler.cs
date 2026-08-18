using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.DeleteDistrict;

public class DeleteDistrictCommandHandler : IRequestHandler<DeleteDistrictCommand, Unit>
{
    private readonly IDistrictWriteRepository _write;

    public DeleteDistrictCommandHandler(IDistrictWriteRepository write) => _write = write;

    public async Task<Unit> Handle(DeleteDistrictCommand request, CancellationToken cancellationToken)
    {
        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("İlçe", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
