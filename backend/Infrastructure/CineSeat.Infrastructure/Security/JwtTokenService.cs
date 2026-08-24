using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Auth.DTOs;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CineSeat.Infrastructure.Security;

/// <summary>
/// ITokenService'in JWT (HS256) implementasyonu. Bu sınıf bilerek
/// Infrastructure'da: System.IdentityModel.Tokens.Jwt bağımlılığı
/// Application katmanına sızmasın diye.
/// </summary>
public class JwtTokenService : ITokenService
{
    private readonly JwtSettings _settings;

    public JwtTokenService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public AccessTokenDto CreateAccessToken(
        long userId,
        string username,
        string email,
        string roleName,
        IEnumerable<string> permissions)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes);

        var claims = new List<Claim>
        {
            // NameIdentifier → ICurrentUserService.UserId bunu okur.
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Email, email),
            // ClaimTypes.Role → [Authorize(Roles = "Admin")] bunu okur.
            new(ClaimTypes.Role, roleName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(
            permissions
                .Where(permission => !string.IsNullOrWhiteSpace(permission))
                .Distinct(StringComparer.Ordinal)
                .OrderBy(permission => permission, StringComparer.Ordinal)
                .Select(permission => new Claim(PermissionClaimTypes.Permission, permission)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return new AccessTokenDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt
        };
    }
}
