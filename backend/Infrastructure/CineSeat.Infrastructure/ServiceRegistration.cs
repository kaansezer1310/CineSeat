using CineSeat.Application.Common.Interfaces;
using CineSeat.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CineSeat.Infrastructure;

public static class ServiceRegistration
{
    /// <summary>
    /// Dış dünyaya bakan servisleri (JWT üretimi, parola hash'leme) kaydeder.
    /// Arayüzler Application'da, implementasyonlar burada — Onion korunuyor.
    /// </summary>
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();

        return services;
    }
}
