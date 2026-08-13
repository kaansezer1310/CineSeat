using System.Reflection;
using CineSeat.Application.Common.Behaviors;
using FluentValidation;
using MediatR;

namespace CineSeat.Application
{
    /// <summary>
    /// Application katmanının kendi DI kaydı. Program.cs sadece bunu çağırır.
    ///
    /// Assembly tarama sayesinde yeni bir Command/Query/Validator eklerken
    /// BU DOSYAYA DA DOKUNULMAZ — üç kişi paralel çalışırken merge conflict çıkmaz.
    /// </summary>
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // Tüm IRequestHandler<,> implementasyonlarını otomatik bulur ve kaydeder.
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

            // Tüm AbstractValidator<T> implementasyonlarını otomatik bulur ve kaydeder.
            services.AddValidatorsFromAssembly(assembly);

            // Pipeline halkaları — sıra önemlidir, istek yukarıdan aşağıya geçer.
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

            return services;
        }
    }
}
