using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Users.Commands.ChangeUserRole;
using CineSeat.Application.Features.Users.DTOs;
using CineSeat.Application.Features.Users.Queries.GetUsers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

/// <summary>
/// Kullanıcı ve rol yönetimi.
///
/// `user.manage` izni seed ediliyor ve policy olarak kayıtlıydı ama hiçbir
/// controller onu kullanmıyordu — bu controller o boşluğu dolduruyor.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PermissionNames.UserManage)]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<UserSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] long? roleId = null,
        CancellationToken cancellationToken = default)
        => Ok(await _mediator.Send(
            new GetUsersQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Search = search,
                RoleId = roleId
            },
            cancellationToken));

    /// <summary>
    /// Kullanıcının rolünü değiştirir. Yönetici kendi rolünü değiştiremez —
    /// sistemde hiç yönetici kalmaması riskine karşı.
    /// </summary>
    [HttpPut("{id:long}/role")]
    public async Task<IActionResult> ChangeRole(
        long id,
        [FromBody] ChangeUserRoleCommand command,
        CancellationToken cancellationToken)
    {
        command.UserId = id;
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }
}
