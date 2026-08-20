namespace CineSeat.Application.Common.Exceptions;

/// <summary>
/// Kimlik doğrulanmamış ya da yetkisiz erişim denemesinde fırlatılır,
/// 401 Unauthorized'a çevrilir.
/// </summary>
public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "Bu işlem için giriş yapmalısınız.")
        : base(message)
    {
    }
}
