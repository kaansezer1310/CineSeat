using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Persistence.Data;

/// <summary>
/// Uygulama başlangıcında çalışır: bekleyen migration'ları uygular ve örnek
/// referans verisini (rol/izin/admin, şehir/ilçe) ekler. Idempotent — veri zaten
/// varsa hiçbir şey yapmaz, tekrar tekrar başlatmak güvenlidir.
/// </summary>
public static class DbInitializer
{
    /// <summary>Seed edilen admin hesabının e-postası.</summary>
    public const string AdminEmail = "admin@cineseat.com";

    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.MigrateAsync();

        await SeedRolesAndPermissionsAsync(context, passwordHasher);
        await SeedLocationsAsync(context);
    }

    /// <summary>
    /// Rol + izin + admin kullanıcısı. Auth'un çalışabilmesi için "User" rolünün
    /// var olması ZORUNLU — Register handler'ı yeni kullanıcıyı bu role bağlar.
    /// </summary>
    private static async Task SeedRolesAndPermissionsAsync(
        ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Roles.AnyAsync())
            return;

        var permissions = new List<Permission>
        {
            new() { Name = "movie.manage",       Description = "Film ekleme/güncelleme/silme" },
            new() { Name = "genre.manage",       Description = "Tür ekleme/güncelleme/silme" },
            new() { Name = "campaign.manage",    Description = "Kampanya ekleme/güncelleme/silme" },
            new() { Name = "cinema.manage",      Description = "Sinema/salon/koltuk yönetimi" },
            new() { Name = "showtime.manage",    Description = "Seans ekleme/güncelleme/silme" },
            new() { Name = "reservation.read",   Description = "Tüm rezervasyonları görüntüleme" },
            new() { Name = "comment.moderate",   Description = "Yorum silme/moderasyon" }
        };
        context.Permissions.AddRange(permissions);

        var adminRole = new Role { Name = RoleNames.Admin };
        var userRole = new Role { Name = RoleNames.User };
        context.Roles.AddRange(adminRole, userRole);

        // Id'lerin oluşması için önce kaydet — RolePermission FK'ları buna bağlı.
        await context.SaveChangesAsync();

        // Admin her izne sahip; normal kullanıcının izin kaydı yok (sadece rol bazlı erişim).
        context.RolePermissions.AddRange(
            permissions.Select(p => new RolePermission { RoleId = adminRole.Id, PermissionId = p.Id }));

        var (hash, salt) = passwordHasher.Hash("Admin123!");
        context.Users.Add(new User
        {
            Name = "Sistem",
            Surname = "Yöneticisi",
            Username = "admin",
            Email = AdminEmail,
            PasswordHash = hash,
            PasswordSalt = salt,
            RoleId = adminRole.Id
        });

        await context.SaveChangesAsync();
    }

    private static async Task SeedLocationsAsync(ApplicationDbContext context)
    {
        if (await context.Cities.AnyAsync())
            return;

        var istanbul = new City { CityName = "İstanbul" };
        var ankara = new City { CityName = "Ankara" };
        var izmir = new City { CityName = "İzmir" };

        istanbul.Districts = new List<District>
        {
            new() { DistrictName = "Kadıköy" },
            new() { DistrictName = "Beşiktaş" },
            new() { DistrictName = "Şişli" }
        };
        ankara.Districts = new List<District>
        {
            new() { DistrictName = "Çankaya" },
            new() { DistrictName = "Keçiören" }
        };
        izmir.Districts = new List<District>
        {
            new() { DistrictName = "Konak" },
            new() { DistrictName = "Bornova" }
        };

        context.Cities.AddRange(istanbul, ankara, izmir);
        await context.SaveChangesAsync();
    }
}
