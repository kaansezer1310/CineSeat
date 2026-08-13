using CineSeat.Application.Common.Interfaces;
using CineSeat.Infrastructure.Data;
using CineSeat.Infrastructure.Data.Interceptors;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Infrastructure
{
    /// <summary>
    /// Infrastructure katmanının DI kaydı. Veritabanı, interceptor ve
    /// Application'daki arayüzlerin somut karşılıkları burada bağlanır.
    /// </summary>
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddSingleton<AuditableEntityInterceptor>();

            services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            {
                options
                    .UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                    .UseSnakeCaseNamingConvention()
                    .AddInterceptors(serviceProvider.GetRequiredService<AuditableEntityInterceptor>());
            });

            // Bağımlılığın tersine çevrildiği satır:
            // Application'ın tanımladığı arayüz, Infrastructure'ın sınıfına bağlanıyor.
            services.AddScoped<IApplicationDbContext>(
                provider => provider.GetRequiredService<ApplicationDbContext>());

            return services;
        }
    }
}
