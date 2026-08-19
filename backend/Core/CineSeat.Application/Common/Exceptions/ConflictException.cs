namespace CineSeat.Application.Common.Exceptions;

/// <summary>
/// Kaynak çakışması durumunda fırlatılır (ör. koltuk başkası tarafından kilitli/rezerve
/// edilmiş), 409 Conflict'e çevrilir.
/// </summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}
