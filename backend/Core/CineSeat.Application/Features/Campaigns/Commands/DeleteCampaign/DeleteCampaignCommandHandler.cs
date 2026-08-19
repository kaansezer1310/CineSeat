using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.DeleteCampaign;

public class DeleteCampaignCommandHandler : IRequestHandler<DeleteCampaignCommand, Unit>
{
    private readonly ICampaignWriteRepository _write;
    private readonly IReservationReadRepository _reservationRead;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public DeleteCampaignCommandHandler(
        ICampaignWriteRepository write,
        IReservationReadRepository reservationRead,
        IAsyncQueryExecutor queryExecutor)
    {
        _write = write;
        _reservationRead = reservationRead;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(DeleteCampaignCommand request, CancellationToken cancellationToken)
    {
        // Geçmiş rezervasyonlar kampanyaya FK ile bağlı; silmek geçmiş kayıtları
        // bozar. Kampanyayı kullanımdan kaldırmak için IsActive=false yeterli.
        var used = await _queryExecutor.AnyAsync(
            _reservationRead.GetWhere(r => r.CampaignId == request.Id, tracking: false), cancellationToken);
        if (used)
            throw new ConflictException(
                "Bu kampanya rezervasyonlarda kullanılmış, silinemez. Bunun yerine pasife alın (IsActive=false).");

        var removed = await _write.RemoveAsync(request.Id, cancellationToken);
        if (!removed)
            throw new NotFoundException("Kampanya", request.Id);

        await _write.SaveAsync(cancellationToken);
        return Unit.Value;
    }
}
