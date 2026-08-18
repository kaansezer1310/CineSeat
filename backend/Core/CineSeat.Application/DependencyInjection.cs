using CineSeat.Application.Common.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace CineSeat.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Tüm IRequestHandler<,> implementasyonlarını otomatik bulur ve kaydeder.
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Tüm AbstractValidator<T> implementasyonlarını otomatik bulur ve kaydeder.
        services.AddValidatorsFromAssembly(assembly);

        // Pipeline halkaları — istek yukarıdan aşağıya sırayla geçer.
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
