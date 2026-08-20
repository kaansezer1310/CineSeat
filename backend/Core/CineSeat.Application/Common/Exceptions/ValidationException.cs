using FluentValidation.Results;

namespace CineSeat.Application.Common.Exceptions;

/// <summary>
/// ValidationBehavior tarafından fırlatılır, WebAPI katmanındaki
/// ExceptionHandlingMiddleware tarafından 400 Bad Request'e çevrilir.
/// </summary>
public class ValidationException : Exception
{
    public ValidationException(IEnumerable<ValidationFailure> failures)
        : base("Bir veya daha fazla doğrulama hatası oluştu.")
    {
        Errors = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(f => f.ErrorMessage).ToArray());
    }

    public IDictionary<string, string[]> Errors { get; }
}
