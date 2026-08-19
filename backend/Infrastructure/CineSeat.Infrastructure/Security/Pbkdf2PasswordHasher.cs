using System.Security.Cryptography;
using CineSeat.Application.Common.Interfaces;

namespace CineSeat.Infrastructure.Security;

/// <summary>
/// IPasswordHasher'ın PBKDF2 (HMAC-SHA256) implementasyonu.
/// Ek NuGet paketi gerektirmez — .NET'in kendi kriptografi kütüphanesini kullanır.
/// </summary>
public class Pbkdf2PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;      // 128 bit
    private const int HashSize = 32;      // 256 bit
    private const int Iterations = 100_000;

    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public (string Hash, string Salt) Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, HashSize);

        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    public bool Verify(string password, string hash, string salt)
    {
        // Bozuk/eksik kayıt varsa exception yerine "doğrulanamadı" döndür.
        if (string.IsNullOrWhiteSpace(hash) || string.IsNullOrWhiteSpace(salt))
            return false;

        byte[] saltBytes;
        byte[] expectedHash;
        try
        {
            saltBytes = Convert.FromBase64String(salt);
            expectedHash = Convert.FromBase64String(hash);
        }
        catch (FormatException)
        {
            return false;
        }

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, Algorithm, expectedHash.Length);

        // Sabit zamanlı karşılaştırma — normal == karşılaştırması ilk farklı
        // baytta çıkar ve zamanlama saldırısına açık kapı bırakır.
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
