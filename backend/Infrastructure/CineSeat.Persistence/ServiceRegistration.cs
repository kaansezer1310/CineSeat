using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Persistence.Data;
using CineSeat.Persistence.Data.Interceptors;
using CineSeat.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CineSeat.Persistence;

public static class ServiceRegistration
{
    public static void AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention()
                   .AddInterceptors(serviceProvider.GetRequiredService<AuditableEntityInterceptor>()));

        // Application katmanının EF'e bakmadan sorgu materyalize edebilmesini sağlar.
        services.AddSingleton<IAsyncQueryExecutor, EfAsyncQueryExecutor>();

        services.AddScoped<ICityReadRepository, CityReadRepository>();
        services.AddScoped<ICityWriteRepository, CityWriteRepository>();

        services.AddScoped<IMovieReadRepository, MovieReadRepository>();
        services.AddScoped<IMovieWriteRepository, MovieWriteRepository>();

        services.AddScoped<IDistrictReadRepository, DistrictReadRepository>();
        services.AddScoped<IDistrictWriteRepository, DistrictWriteRepository>();

        services.AddScoped<ICinemaReadRepository, CinemaReadRepository>();
        services.AddScoped<ICinemaWriteRepository, CinemaWriteRepository>();
    }
}
