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
        var permissionDefinitions = new (string Name, string Description)[]
        {
            (PermissionNames.MovieManage, "Film ekleme/güncelleme/silme"),
            (PermissionNames.GenreManage, "Tür ekleme/güncelleme/silme"),
            (PermissionNames.CampaignManage, "Kampanya ekleme/güncelleme/silme"),
            (PermissionNames.CinemaManage, "Sinema/salon/koltuk yönetimi"),
            (PermissionNames.ShowtimeManage, "Seans ekleme/güncelleme/silme"),
            (PermissionNames.ReservationRead, "Tüm rezervasyonları görüntüleme"),
            (PermissionNames.ReservationManage, "Tüm rezervasyonları iptal etme/yönetme"),
            (PermissionNames.CommentModerate, "Yorum silme/moderasyon"),
            (PermissionNames.UserManage, "Kullanıcı ve rol yönetimi")
        };

        var permissions = await context.Permissions
            .IgnoreQueryFilters()
            .ToListAsync();

        foreach (var definition in permissionDefinitions)
        {
            var permission = permissions.FirstOrDefault(item => item.Name == definition.Name);
            if (permission is null)
            {
                permission = new Permission
                {
                    Name = definition.Name,
                    Description = definition.Description
                };
                permissions.Add(permission);
                context.Permissions.Add(permission);
            }
            else
            {
                permission.Description = definition.Description;
                permission.IsDeleted = false;
            }
        }

        var roles = await context.Roles.IgnoreQueryFilters().ToListAsync();
        var adminRole = roles.FirstOrDefault(role => role.Name == RoleNames.Admin);
        if (adminRole is null)
        {
            adminRole = new Role { Name = RoleNames.Admin };
            context.Roles.Add(adminRole);
        }
        else
        {
            adminRole.IsDeleted = false;
        }

        var userRole = roles.FirstOrDefault(role => role.Name == RoleNames.User);
        if (userRole is null)
        {
            userRole = new Role { Name = RoleNames.User };
            context.Roles.Add(userRole);
        }
        else
        {
            userRole.IsDeleted = false;
        }

        // Yeni rol/izinlerin Id'leri RolePermission kayıtlarından önce oluşmalı.
        await context.SaveChangesAsync();

        var adminRolePermissions = await context.RolePermissions
            .IgnoreQueryFilters()
            .Where(rolePermission => rolePermission.RoleId == adminRole.Id)
            .ToListAsync();

        foreach (var permission in permissions.Where(item => !item.IsDeleted))
        {
            var rolePermission = adminRolePermissions.FirstOrDefault(
                item => item.PermissionId == permission.Id);

            if (rolePermission is null)
            {
                context.RolePermissions.Add(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id
                });
            }
            else
            {
                rolePermission.IsDeleted = false;
            }
        }

        var adminUser = await context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(user => user.Email == AdminEmail);

        if (adminUser is null)
        {
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
        }
        else
        {
            adminUser.RoleId = adminRole.Id;
            adminUser.IsDeleted = false;
        }

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Şehir ve ilçeler.
    ///
    /// Kayıt kayıt idempotent: önceden "şehir tablosunda herhangi bir satır
    /// varsa hiç dokunma" deniyordu. Elle tek bir şehir eklenmiş bir
    /// veritabanında bu, İstanbul/Ankara/İzmir ve TÜM ilçelerin bir daha asla
    /// oluşmaması demekti — sinema kaydı ilçeye bağlı olduğu için katalog
    /// kurulamıyordu. Artık eksik olan ne varsa tamamlanır.
    /// </summary>
    private static async Task SeedLocationsAsync(ApplicationDbContext context)
    {
        // Türkiye'nin 81 ili — plaka sırasıyla. Sinema barındıran iller
        // gerçek ilçe adlarıyla listelenir; geri kalanı için tek bir
        // "Merkez" ilçesi yeterli (çoğu ilde zaten gerçekten böyle bir
        // ilçe var) — amaç şehir seçme dropdown'ının tüm illeri içermesi.
        var definitions = new (string City, string[] Districts)[]
        {
            ("Adana", ["Seyhan", "Çukurova"]),
            ("Adıyaman", ["Merkez"]),
            ("Afyonkarahisar", ["Merkez"]),
            ("Ağrı", ["Merkez"]),
            ("Amasya", ["Merkez"]),
            ("Ankara", ["Çankaya", "Keçiören"]),
            ("Antalya", ["Muratpaşa", "Konyaaltı"]),
            ("Artvin", ["Merkez"]),
            ("Aydın", ["Merkez"]),
            ("Balıkesir", ["Merkez"]),
            ("Bilecik", ["Merkez"]),
            ("Bingöl", ["Merkez"]),
            ("Bitlis", ["Merkez"]),
            ("Bolu", ["Merkez"]),
            ("Burdur", ["Merkez"]),
            ("Bursa", ["Nilüfer", "Osmangazi"]),
            ("Çanakkale", ["Merkez"]),
            ("Çankırı", ["Merkez"]),
            ("Çorum", ["Merkez"]),
            ("Denizli", ["Pamukkale", "Merkezefendi"]),
            ("Diyarbakır", ["Kayapınar", "Bağlar"]),
            ("Edirne", ["Merkez"]),
            ("Elazığ", ["Merkez"]),
            ("Erzincan", ["Merkez"]),
            ("Erzurum", ["Merkez"]),
            ("Eskişehir", ["Tepebaşı", "Odunpazarı"]),
            ("Gaziantep", ["Şehitkamil", "Şahinbey"]),
            ("Giresun", ["Merkez"]),
            ("Gümüşhane", ["Merkez"]),
            ("Hakkari", ["Merkez"]),
            ("Hatay", ["Merkez"]),
            ("Isparta", ["Merkez"]),
            ("Mersin", ["Yenişehir", "Toroslar"]),
            ("İstanbul", ["Kadıköy", "Beşiktaş", "Şişli"]),
            ("İzmir", ["Konak", "Bornova"]),
            ("Kars", ["Merkez"]),
            ("Kastamonu", ["Merkez"]),
            ("Kayseri", ["Melikgazi", "Kocasinan"]),
            ("Kırklareli", ["Merkez"]),
            ("Kırşehir", ["Merkez"]),
            ("Kocaeli", ["İzmit", "Gebze"]),
            ("Konya", ["Selçuklu", "Meram"]),
            ("Kütahya", ["Merkez"]),
            ("Malatya", ["Yeşilyurt", "Battalgazi"]),
            ("Manisa", ["Şehzadeler", "Yunusemre"]),
            ("Kahramanmaraş", ["Merkez"]),
            ("Mardin", ["Merkez"]),
            ("Muğla", ["Merkez"]),
            ("Muş", ["Merkez"]),
            ("Nevşehir", ["Merkez"]),
            ("Niğde", ["Merkez"]),
            ("Ordu", ["Merkez"]),
            ("Rize", ["Merkez"]),
            ("Sakarya", ["Merkez"]),
            ("Samsun", ["İlkadım", "Atakum"]),
            ("Siirt", ["Merkez"]),
            ("Sinop", ["Merkez"]),
            ("Sivas", ["Merkez"]),
            ("Tekirdağ", ["Merkez"]),
            ("Tokat", ["Merkez"]),
            ("Trabzon", ["Ortahisar", "Akçaabat"]),
            ("Tunceli", ["Merkez"]),
            ("Şanlıurfa", ["Eyyübiye", "Haliliye"]),
            ("Uşak", ["Merkez"]),
            ("Van", ["İpekyolu", "Tuşba"]),
            ("Yozgat", ["Merkez"]),
            ("Zonguldak", ["Merkez"]),
            ("Aksaray", ["Merkez"]),
            ("Bayburt", ["Merkez"]),
            ("Karaman", ["Merkez"]),
            ("Kırıkkale", ["Merkez"]),
            ("Batman", ["Merkez"]),
            ("Şırnak", ["Merkez"]),
            ("Bartın", ["Merkez"]),
            ("Ardahan", ["Merkez"]),
            ("Iğdır", ["Merkez"]),
            ("Yalova", ["Merkez"]),
            ("Karabük", ["Merkez"]),
            ("Kilis", ["Merkez"]),
            ("Osmaniye", ["Merkez"]),
            ("Düzce", ["Merkez"])
        };

        var cities = await context.Cities.IgnoreQueryFilters().ToListAsync();

        foreach (var definition in definitions)
        {
            var city = cities.FirstOrDefault(c => c.CityName == definition.City);

            if (city is null)
            {
                city = new City { CityName = definition.City };
                context.Cities.Add(city);
                cities.Add(city);
            }
            else
            {
                city.IsDeleted = false;
            }
        }

        // İlçeler şehir Id'sine bağlı; şehirler önce kaydedilmeli.
        await context.SaveChangesAsync();

        var districts = await context.Districts.IgnoreQueryFilters().ToListAsync();

        foreach (var definition in definitions)
        {
            var city = cities.First(c => c.CityName == definition.City);

            foreach (var districtName in definition.Districts)
            {
                var district = districts.FirstOrDefault(
                    d => d.CityId == city.Id && d.DistrictName == districtName);

                if (district is null)
                {
                    district = new District
                    {
                        CityId = city.Id,
                        DistrictName = districtName
                    };

                    context.Districts.Add(district);
                    districts.Add(district);
                }
                else
                {
                    district.IsDeleted = false;
                }
            }
        }

        await context.SaveChangesAsync();
    }
}
