using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

/// <summary>
/// Rol listesi — kullanıcı yönetimi ekranındaki rol seçimi için.
/// Basit bir okuma olduğu için CQRS katmanına ayrı bir query eklenmedi.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PermissionNames.UserManage)]
public class RolesController : ControllerBase
{
    private readonly IRoleReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public RolesController(IRoleReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false)
            .OrderBy(role => role.Name)
            .Select(role => new { role.Id, role.Name });

        return Ok(await _executor.ToListAsync(query, cancellationToken));
    }
}
