namespace CineSeat.Application.Common.Constants;

/// <summary>
/// Rol adları tek yerde. Hem seed (DbInitializer) hem Register handler'ı hem de
/// [Authorize(Roles = ...)] öznitelikleri aynı sabitleri kullanır ki yazım
/// hatası sessiz bir yetki açığına dönüşmesin.
/// </summary>
public static class RoleNames
{
    public const string Admin = "Admin";
    public const string User = "User";
}
