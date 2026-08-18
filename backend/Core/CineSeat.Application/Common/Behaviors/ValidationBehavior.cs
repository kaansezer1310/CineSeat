using FluentValidation;
using MediatR;
using ValidationException = CineSeat.Application.Common.Exceptions.ValidationException;

namespace CineSeat.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline halkası. Handler çalışmadan ÖNCE devreye girer ve
/// isteğe ait tüm FluentValidation kurallarını çalıştırır.
///
/// Kazancı: hiçbir handler'ın içinde tek satır doğrulama kodu yok.
/// Yeni bir Validator eklemek yeterli — bu sınıfa dokunulmaz.
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Bu istek için hiç validator kaydedilmemişse doğrudan handler'a geç.
        // (Örn. Cities feature'ının henüz validator'ı yok — akış bozulmaz.)
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var results = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = results.SelectMany(r => r.Errors).Where(f => f is not null).ToList();

        if (failures.Count > 0)
        {
            // Handler hiç çağrılmaz; middleware bunu 400'e çevirir.
            throw new ValidationException(failures);
        }

        return await next();
    }
}
