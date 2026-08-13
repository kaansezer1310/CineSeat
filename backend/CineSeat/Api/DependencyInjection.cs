namespace CineSeat.Api
{
    /// <summary>
    /// Api katmanının DI kaydı: controller'lar ve OpenAPI/Swagger.
    /// </summary>
    public static class DependencyInjection
    {
        public static IServiceCollection AddApi(this IServiceCollection services)
        {
            services.AddControllers();
            services.AddOpenApi();

            return services;
        }
    }
}
