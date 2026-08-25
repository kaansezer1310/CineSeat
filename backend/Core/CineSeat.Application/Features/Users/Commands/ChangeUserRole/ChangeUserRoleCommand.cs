using MediatR;

namespace CineSeat.Application.Features.Users.Commands.ChangeUserRole;

/// <summary>
/// Bir kullanicinin rolunu degistirir. Yetki yukseltme anlamina geldigi icin
/// yalnizca user.manage izniyle cagrilabilir.
/// </summary>
public class ChangeUserRoleCommand : IRequest<Unit>
{
    public long UserId { get; set; }
    public long RoleId { get; set; }
}
