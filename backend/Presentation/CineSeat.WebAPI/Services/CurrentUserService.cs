using System.Security.Claims;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;

namespace CineSeat.WebAPI.Services;

/// <summary>
/// ICurrentUserService'in HTTP implementasyonu. Claim'leri JwtTokenService'in
/// yazdığı isimlerle okur. Bu sınıf WebAPI'de: IHttpContextAccessor bir ASP.NET
/// tipi ve Application katmanında yeri yok.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    public long? UserId
    {
        get
        {
            var raw = Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(raw, out var id) ? id : null;
        }
    }

    public string? Username => Principal?.FindFirstValue(ClaimTypes.Name);

    public string? Role => Principal?.FindFirstValue(ClaimTypes.Role);

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    public long GetRequiredUserId()
        => UserId ?? throw new UnauthorizedException();
}
