namespace CineSeat.Application.Common.Constants;

/// <summary>
/// Rol adları tek yerde. Seed, kayıt ve kullanıcı özetleri aynı sabitleri
/// kullanır. Kaynak erişimi rol adına değil PermissionNames policy'lerine bağlıdır.
/// </summary>
public static class RoleNames
{
    public const string Admin = "Admin";
    public const string User = "User";
}
