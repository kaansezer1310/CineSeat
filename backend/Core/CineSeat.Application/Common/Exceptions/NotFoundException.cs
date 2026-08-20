namespace CineSeat.Application.Common.Exceptions;

/// <summary>
/// İstenen kayıt bulunamadığında fırlatılır, 404 Not Found'a çevrilir.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} bulunamadı. (anahtar: {key})")
    {
    }
}
