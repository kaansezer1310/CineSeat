using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Persistence.Data;

/// <summary>
/// Uygulama başlangıcında çalışır: bekleyen migration'ları uygular ve örnek
/// referans verisini (şehir/ilçe) ekler. Idempotent — veri zaten varsa hiçbir
/// şey yapmaz, tekrar tekrar başlatmak güvenlidir.
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

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
