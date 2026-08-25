using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;

public class ReleaseSeatCommandHandler : IRequestHandler<ReleaseSeatCommand, Unit>
{
    private readonly ISeatLockReadRepository _read;
    private readonly ISeatLockWriteRepository _write;
    private readonly ICurrentUserService _currentUser;

    public ReleaseSeatCommandHandler(
        ISeatLockReadRepository read,
        ISeatLockWriteRepository write,
        ICurrentUserService currentUser)
    {
        _read = read;
        _write = write;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(ReleaseSeatCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var canManageShowtimes = _currentUser.HasPermission(PermissionNames.ShowtimeManage);

        var seatLock = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);

        // Birakma islemi IDEMPOTENT: "bu kilit gitmis olsun" demek. Kilit
        // zaten yoksa amac gerceklesmis demektir, hata degil.
        //
        // Bu onemli: rezervasyon olustugunda kilit satirlari ayni transaction
        // icinde siliniyor. Odeme akisi sonrasinda temizlik yapan istemci,
        // artik var olmayan kimlikleri biraktigi icin her seferinde 404
        // aliyordu.
        if (seatLock is null)
            return Unit.Value;

        // Sahiplik kontrolu SART: id ile silinebilseydi herkes baskasinin
        // koltuk kilidini acip o koltugu kapabilirdi.
        //
        // Reddedilen istek de sessizce basarili doner: 404 dondurmek
        // "bu kilit var ama senin degil" bilgisini sizdirirdi ve id deneyen
        // biri gecerli kilitleri haritalayabilirdi. Kilide DOKUNULMUYOR;
        // saldirgan hicbir sey elde etmiyor.
        if (seatLock.UserId != userId && !canManageShowtimes)
            return Unit.Value;

        _write.HardDelete(seatLock);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
