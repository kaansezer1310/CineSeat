namespace CineSeat.Application.Common.Interfaces;

/// <summary>
/// Parola hash'leme soyutlaması. Algoritma (PBKDF2/BCrypt/Argon2) bir altyapı
/// kararıdır; Application yalnızca "hash'le" ve "doğrula" der.
/// Implementasyon: CineSeat.Infrastructure.Security.Pbkdf2PasswordHasher
/// </summary>
public interface IPasswordHasher
{
    /// <summary>Yeni bir salt üretip parolayı hash'ler.</summary>
    (string Hash, string Salt) Hash(string password);

    /// <summary>Girilen parolayı kayıtlı hash+salt ile karşılaştırır.</summary>
    bool Verify(string password, string hash, string salt);
}
