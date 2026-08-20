using CineSeat.Application.Features.Auth.DTOs;

namespace CineSeat.Application.Common.Interfaces;

/// <summary>
/// JWT üretimi soyutlaması.
///
/// NEDEN VAR: token üretimi System.IdentityModel.Tokens.Jwt paketine bağlıdır ve
/// bu paket bir altyapı detayıdır. Application "bana bu kullanıcı için token üret"
/// der, "HS256 ile imzala" demez. Implementasyon: CineSeat.Infrastructure.Security.JwtTokenService
/// </summary>
public interface ITokenService
{
    /// <param name="roleName">Token'a "role" claim'i olarak yazılır; [Authorize(Roles = "Admin")] bunu okur.</param>
    AccessTokenDto CreateAccessToken(long userId, string username, string email, string roleName);
}
