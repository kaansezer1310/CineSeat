using CineSeat.Domain.Entities;
using CineSeat.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Persistence.Data;

/// <summary>
/// GELISTIRME ORTAMI icin ornek katalog verisi: tur, teknoloji, sinema, salon,
/// koltuk, film, seans ve kampanya.
///
/// NEDEN AYRI BIR SINIF: <see cref="DbInitializer"/> uygulamanin CALISABILMESI
/// icin zorunlu referans verisini ekler (rol, izin, admin, sehir/ilce) ve her
/// ortamda calisir. Buradaki veri ise yalnizca demo/gelistirme icindir —
/// canliya cikildiginda ornek film/sinema katalogunun veritabaninda olmasi
/// istenmez. Bu yuzden cagrisi Program.cs'te ortam kontrolune baglidir.
///
/// Idempotent: her adim once "zaten var mi" diye bakar, tekrar tekrar
/// baslatmak guvenlidir.
/// </summary>
public static class DemoDataSeeder
{
    // Salon basina koltuk izgarasi. 8 sira x 10 sutun = 80 koltuk.
    private const int RowCount = 8;
    private const int ColumnCount = 10;

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var genres = await SeedGenresAsync(context);
        var technologies = await SeedTechnologiesAsync(context);
        var halls = await SeedCinemasAndHallsAsync(context, technologies);
        await SeedSeatsAsync(context, halls);
        var movies = await SeedMoviesAsync(context, genres);
        await SeedShowtimesAsync(context, movies, halls);
        await SeedCampaignsAsync(context);
    }

    private static async Task<Dictionary<string, Genre>> SeedGenresAsync(
        ApplicationDbContext context)
    {
        var names = new[]
        {
            "Aksiyon", "Dram", "Komedi", "Bilim Kurgu",
            "Gerilim", "Animasyon", "Belgesel"
        };

        var existing = await context.Genres.ToListAsync();

        foreach (var name in names.Where(n => existing.All(g => g.Name != n)))
        {
            var genre = new Genre { Name = name };
            context.Genres.Add(genre);
            existing.Add(genre);
        }

        await context.SaveChangesAsync();

        return existing.ToDictionary(genre => genre.Name);
    }

    private static async Task<Dictionary<string, Technology>> SeedTechnologiesAsync(
        ApplicationDbContext context)
    {
        var names = new[] { "2D", "3D", "IMAX", "Dolby Atmos" };

        var existing = await context.Technologies.ToListAsync();

        foreach (var name in names.Where(n => existing.All(t => t.Name != n)))
        {
            var technology = new Technology { Name = name };
            context.Technologies.Add(technology);
            existing.Add(technology);
        }

        await context.SaveChangesAsync();

        return existing.ToDictionary(technology => technology.Name);
    }

    /// <summary>
    /// Iki sinema, her birine iki salon. Sinemalar DbInitializer'in ekledigi
    /// ilcelere baglanir; ilce bulunamazsa o sinema atlanir (seed sirasi
    /// bozulsa bile uygulama acilmali).
    /// </summary>
    private static async Task<List<Hall>> SeedCinemasAndHallsAsync(
        ApplicationDbContext context, Dictionary<string, Technology> technologies)
    {
        var definitions = new[]
        {
            new
            {
                CinemaName = "CineSeat Kadikoy",
                District = "Kadıköy",
                Address = "Bahariye Caddesi No:12, Kadıköy/İstanbul",
                Latitude = 40.9819m,
                Longitude = 29.0233m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Cankaya",
                District = "Çankaya",
                Address = "Tunalı Hilmi Caddesi No:45, Çankaya/Ankara",
                Latitude = 39.9208m,
                Longitude = 32.8541m,
                Halls = new[] { "Salon A", "Salon B" }
            },
            new
            {
                CinemaName = "CineSeat Konak",
                District = "Konak",
                Address = "Cumhuriyet Bulvarı No:22, Konak/İzmir",
                Latitude = 38.4189m,
                Longitude = 27.1287m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Nilufer",
                District = "Nilüfer",
                Address = "İzmir Yolu Caddesi No:60, Nilüfer/Bursa",
                Latitude = 40.2106m,
                Longitude = 28.9636m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Muratpasa",
                District = "Muratpaşa",
                Address = "Işıklar Caddesi No:10, Muratpaşa/Antalya",
                Latitude = 36.8841m,
                Longitude = 30.7056m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Seyhan",
                District = "Seyhan",
                Address = "Turhan Cemal Beriker Bulvarı No:15, Seyhan/Adana",
                Latitude = 37.0000m,
                Longitude = 35.3213m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Selcuklu",
                District = "Selçuklu",
                Address = "Mevlana Caddesi No:20, Selçuklu/Konya",
                Latitude = 37.8746m,
                Longitude = 32.4932m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Sehitkamil",
                District = "Şehitkamil",
                Address = "İncilipınar Mahallesi No:8, Şehitkamil/Gaziantep",
                Latitude = 37.0662m,
                Longitude = 37.3833m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Yenisehir",
                District = "Yenişehir",
                Address = "İstiklal Caddesi No:8, Yenişehir/Mersin",
                Latitude = 36.8000m,
                Longitude = 34.6333m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Melikgazi",
                District = "Melikgazi",
                Address = "Sivas Caddesi No:33, Melikgazi/Kayseri",
                Latitude = 38.7205m,
                Longitude = 35.4826m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Tepebasi",
                District = "Tepebaşı",
                Address = "Espark Yolu No:1, Tepebaşı/Eskişehir",
                Latitude = 39.7767m,
                Longitude = 30.5206m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Ilkadim",
                District = "İlkadım",
                Address = "Gazi Caddesi No:44, İlkadım/Samsun",
                Latitude = 41.2867m,
                Longitude = 36.3300m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Izmit",
                District = "İzmit",
                Address = "Hürriyet Caddesi No:12, İzmit/Kocaeli",
                Latitude = 40.7654m,
                Longitude = 29.9408m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Ortahisar",
                District = "Ortahisar",
                Address = "Kahramanmaraş Caddesi No:7, Ortahisar/Trabzon",
                Latitude = 41.0027m,
                Longitude = 39.7168m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Pamukkale",
                District = "Pamukkale",
                Address = "2. Ticari Yol No:9, Pamukkale/Denizli",
                Latitude = 37.7765m,
                Longitude = 29.0864m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Eyyubiye",
                District = "Eyyübiye",
                Address = "Sarayönü Caddesi No:18, Eyyübiye/Şanlıurfa",
                Latitude = 37.1591m,
                Longitude = 38.7969m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Yesilyurt",
                District = "Yeşilyurt",
                Address = "Fuzuli Caddesi No:25, Yeşilyurt/Malatya",
                Latitude = 38.3552m,
                Longitude = 38.3095m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Ipekyolu",
                District = "İpekyolu",
                Address = "Cumhuriyet Caddesi No:14, İpekyolu/Van",
                Latitude = 38.4891m,
                Longitude = 43.4089m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Kayapinar",
                District = "Kayapınar",
                Address = "Ofis Caddesi No:6, Kayapınar/Diyarbakır",
                Latitude = 37.9144m,
                Longitude = 40.2306m,
                Halls = new[] { "Salon 1", "Salon 2" }
            },
            new
            {
                CinemaName = "CineSeat Sehzadeler",
                District = "Şehzadeler",
                Address = "Doğu Caddesi No:19, Şehzadeler/Manisa",
                Latitude = 38.6191m,
                Longitude = 27.4289m,
                Halls = new[] { "Salon 1", "Salon 2" }
            }
        };

        var districts = await context.Districts.ToListAsync();
        var cinemas = await context.Cinemas.ToListAsync();

        foreach (var definition in definitions)
        {
            if (cinemas.Any(c => c.Name == definition.CinemaName))
                continue;

            // Adlandirilmis ilce bulunamazsa herhangi birine bagla: demo
            // katalogunun sessizce bos kalmasindansa yanlis ilcede bir sinema
            // olmasi yeglenir. Hic ilce yoksa yapacak bir sey yok.
            var district =
                districts.FirstOrDefault(d => d.DistrictName == definition.District)
                ?? districts.FirstOrDefault();

            if (district is null)
                return [];

            var cinema = new Cinema
            {
                Name = definition.CinemaName,
                Address = definition.Address,
                Latitude = definition.Latitude,
                Longitude = definition.Longitude,
                DistrictId = district.Id
            };

            context.Cinemas.Add(cinema);
            cinemas.Add(cinema);
        }

        await context.SaveChangesAsync();

        var halls = await context.Halls.ToListAsync();

        foreach (var definition in definitions)
        {
            var cinema = cinemas.FirstOrDefault(c => c.Name == definition.CinemaName);
            if (cinema is null)
                continue;

            foreach (var hallName in definition.Halls)
            {
                if (halls.Any(h => h.CinemaId == cinema.Id && h.Name == hallName))
                    continue;

                var hall = new Hall { Name = hallName, CinemaId = cinema.Id };
                context.Halls.Add(hall);
                halls.Add(hall);
            }
        }

        await context.SaveChangesAsync();

        await SeedHallTechnologiesAsync(context, halls, technologies);

        return halls;
    }

    private static async Task SeedHallTechnologiesAsync(
        ApplicationDbContext context,
        List<Hall> halls,
        Dictionary<string, Technology> technologies)
    {
        var existing = await context.HallTechs.ToListAsync();

        foreach (var hall in halls)
        {
            // Her salonda 2D var; ilk salonlar ayrica IMAX destekler.
            var names = hall.Name.EndsWith("1") || hall.Name.EndsWith("A")
                ? new[] { "2D", "IMAX" }
                : new[] { "2D", "3D" };

            foreach (var name in names)
            {
                if (!technologies.TryGetValue(name, out var technology))
                    continue;

                if (existing.Any(ht => ht.HallId == hall.Id
                                       && ht.TechnologyId == technology.Id))
                    continue;

                var hallTech = new HallTech
                {
                    HallId = hall.Id,
                    TechnologyId = technology.Id
                };

                context.HallTechs.Add(hallTech);
                existing.Add(hallTech);
            }
        }

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Salon basina koltuk izgarasi. Kenar koltuklardan ikisi bilerek devre
    /// disi birakiliyor: koltuk plani "duzgun dikdortgen salon" varsayimina
    /// dayanmadigi icin bu durumun arayuzde de gorulebilmesi gerekiyor.
    /// </summary>
    private static async Task SeedSeatsAsync(
        ApplicationDbContext context, List<Hall> halls)
    {
        foreach (var hall in halls)
        {
            var hasSeats = await context.Seats.AnyAsync(s => s.HallId == hall.Id);
            if (hasSeats)
                continue;

            var seats = new List<Seat>();

            for (short row = 1; row <= RowCount; row++)
            {
                for (short column = 1; column <= ColumnCount; column++)
                {
                    // Son sira ortasi cift kisilik (LoveSeat), ilk sira
                    // kenarlari tekerlekli sandalye alani.
                    var type = row == RowCount && column is 5 or 6
                        ? SeatType.LoveSeat
                        : row == 1 && column is 1 or ColumnCount
                            ? SeatType.Disabled
                            : SeatType.Regular;

                    // Salonun bir kosesinde kolon var: iki koltuk kullanilamaz.
                    var isActive = !(row == 4 && column is 1 or 2);

                    seats.Add(new Seat
                    {
                        HallId = hall.Id,
                        SeatRow = row,
                        SeatColumn = column,
                        Type = type,
                        IsActive = isActive
                    });
                }
            }

            await context.Seats.AddRangeAsync(seats);
        }

        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Filmler. Tarihler CALISMA ANINA gore hesaplaniyor: seed sabit tarihler
    /// icerseydi birkac ay sonra tum filmler "arsivde" gorunur, demo veri ise
    /// yaramaz hale gelirdi.
    /// </summary>
    /// <summary>
    /// Vizyondaki gercek filmler.
    ///
    /// TARIHLER: vizyon tarihi gercek. Bitis tarihi ise "gercek vizyon suresi"
    /// ile "bugunden en az 45 gun sonrasi"nin buyugu olarak hesaplaniyor.
    /// Sabit bir bitis tarihi yazilsaydi seed birkac ay sonra calistirildiginda
    /// tum filmler arsive duser, katalog bos gorunurdu.
    ///
    /// AFISLER: gercek film afisleri telifli goreseldir. TMDB'nin (The Movie
    /// Database) herkese acik gorsel CDN'ine dogrudan baglantiyla
    /// gosteriliyor — repoya hicbir gorsel dosyasi kopyalanmiyor.
    /// </summary>
    private static async Task<List<Movie>> SeedMoviesAsync(
        ApplicationDbContext context, Dictionary<string, Genre> genres)
    {
        var today = DateTime.UtcNow.Date;

        // Katalogun her zaman dolu gorunmesi icin en gec bitis tarihi.
        // Npgsql 'timestamp with time zone' sutununa yalnizca Kind=Utc
        // DateTime yazabilir; asagidaki tarih sabitleri de bu yuzden Utc.
        DateTime EndDateFor(DateTime startDate, int runDays) =>
            new[] { startDate.AddDays(runDays), today.AddDays(45) }.Max();

        var definitions = new[]
        {
            // --- Vizyonda ---
            new
            {
                Title = "The Godfather",
                Duration = (short)175,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/vseIVRdN4xasYwStQIi6SI7DcEu.jpg",
                Description = "Sicilyali koklere sahip guclu bir ailenin basindaki adam, "
                    + "iktidarini korumak icin acimasiz bir dunyada yol almak zorunda kalir.",
                StartDate = new DateTime(2026, 2, 13, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 180,
                Genres = new[] { "Dram", "Gerilim" }
            },
            new
            {
                Title = "Interstellar",
                Duration = (short)169,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/xbiycuc84TrieEWwkkuH2hoEa9S.jpg",
                Description = "Dunyanin yasanmaz hale geldigi bir gelecekte, bir grup kasif "
                    + "insanlik icin yeni bir yuva bulmak amaciyla uzayin derinliklerine "
                    + "yolculuk eder.",
                StartDate = new DateTime(2026, 3, 6, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 160,
                Genres = new[] { "Bilim Kurgu", "Dram" }
            },
            new
            {
                Title = "Oppenheimer",
                Duration = (short)181,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/mmZi0tyPFfbcCqEsJIPxVldCPOL.jpg",
                Description = "Bir bilim insaninin, insanligin kaderini degistirecek bir "
                    + "silahi gelistirirken yasadigi agir vicdani hesaplasma anlatilir.",
                StartDate = new DateTime(2026, 3, 27, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 150,
                Genres = new[] { "Dram", "Gerilim" }
            },
            new
            {
                Title = "The Grand Budapest Hotel",
                Duration = (short)100,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/hYdclrAOjWtxTgE7PZy102hTYAf.jpg",
                Description = "Gorkemli bir dag otelinin efsanevi konsiyerji, sadik "
                    + "cirağiyla birlikte tuhaf ve komik bir miras davasina suruklenir.",
                StartDate = new DateTime(2026, 4, 10, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 110,
                Genres = new[] { "Komedi", "Dram" }
            },
            new
            {
                Title = "The Dark Knight",
                Duration = (short)152,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/7IPCEr7ifdH5CtU97QG7XgAAtOp.jpg",
                Description = "Bir sehri karanliga gommeye calisan kaotik bir suclu ile "
                    + "maskeli bir koruyucu, tum sinirlarin zorlandigi bir mucadeleye girer.",
                StartDate = new DateTime(2026, 4, 24, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 140,
                Genres = new[] { "Aksiyon", "Gerilim" }
            },
            new
            {
                Title = "Parasite",
                Duration = (short)133,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/nx7TmJDMkgyBc09DVo5ze52Wt3F.jpg",
                Description = "Yoksul bir aile, zengin bir hanenin hayatina sizdikca "
                    + "beklenmedik ve gerilimli sonuclarla karsilasir.",
                StartDate = new DateTime(2026, 5, 8, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 120,
                Genres = new[] { "Dram", "Gerilim" }
            },
            new
            {
                Title = "Toy Story",
                Duration = (short)81,
                AgeLimit = (short)0,
                Language = "Turkce Dublaj",
                Poster = "https://image.tmdb.org/t/p/w500/4KAtscEx3Pt9YPpNuK3BO6irQn1.jpg",
                Description = "Bir cocuk odasindaki oyuncaklar, aralarina katilan parlak "
                    + "yeni bir oyuncakla birlikte dostlugun sinandigi bir maceraya "
                    + "suruklenir.",
                StartDate = new DateTime(2026, 5, 22, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 130,
                Genres = new[] { "Animasyon", "Komedi" }
            },
            new
            {
                Title = "La La Land",
                Duration = (short)128,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/xDBZNak6HyOEjKIbrjqDxllWXRn.jpg",
                Description = "Hayallerinin pesinden kosan bir muzisyen ve bir oyuncu "
                    + "adayi, Los Angeles'ta ask ile tutku arasinda bir denge kurmaya calisir.",
                StartDate = new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 110,
                Genres = new[] { "Dram", "Komedi" }
            },
            new
            {
                Title = "Barbie",
                Duration = (short)114,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/o1BB6Cimho6R72QzJDwcwnCkp2a.jpg",
                Description = "Mukemmel bir dunyada yasayan bir oyuncak bebek, gercek "
                    + "dunyayla tanisinca kendi kimligini sorgulamaya baslar.",
                StartDate = new DateTime(2026, 6, 19, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 110,
                Genres = new[] { "Komedi" }
            },
            new
            {
                Title = "Get Out",
                Duration = (short)104,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/2Uo7WiwHKb27i8Qskqy4arxaoLz.jpg",
                Description = "Sevgilisinin ailesini ziyarete giden genc bir adam, sicak "
                    + "karsilamanin ardinda saklanan rahatsiz edici bir sirri kesfeder.",
                StartDate = new DateTime(2026, 6, 26, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 90,
                Genres = new[] { "Gerilim" }
            },
            new
            {
                Title = "Inside Out 2",
                Duration = (short)96,
                AgeLimit = (short)0,
                Language = "Turkce Dublaj",
                Poster = "https://image.tmdb.org/t/p/w500/xYqeUheNCep7ll9AotOcclGhP0X.jpg",
                Description = "Genc bir kizin zihnindeki duygular, ergenlikle birlikte "
                    + "gelen yeni ve karmasik hislerle bas etmeyi ogrenir.",
                StartDate = new DateTime(2026, 7, 3, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Animasyon", "Komedi" }
            },
            new
            {
                Title = "Mad Max: Fury Road",
                Duration = (short)121,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/mnKUoJFdNbQVs4f7nEGW6p7CgsA.jpg",
                Description = "Issiz bir colde hayatta kalmaya calisan bir gezgin, zalim "
                    + "bir despottan kacan bir grup kadina yardim etmek icin tehlikeli "
                    + "bir yolculuga ortak olur.",
                StartDate = new DateTime(2026, 7, 10, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 90,
                Genres = new[] { "Aksiyon", "Bilim Kurgu" }
            },
            new
            {
                Title = "Godzilla Minus One",
                Duration = (short)125,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/dHiXX2YPkkxQ8XvR49xuX0XoGar.jpg",
                Description = "Savasin yikintilari arasinda yeniden ayaga kalkmaya "
                    + "calisan bir halk, denizlerden gelen devasa bir tehditle yuzlesir.",
                StartDate = new DateTime(2026, 7, 17, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Bilim Kurgu", "Aksiyon" }
            },
            new
            {
                Title = "Spider-Man: Across the Spider-Verse",
                Duration = (short)140,
                AgeLimit = (short)13,
                Language = "Turkce Dublaj",
                Poster = "https://image.tmdb.org/t/p/w500/2k49onFB4SnbMWgczIhf1JWl6Tr.jpg",
                Description = "Genc bir kahraman, sonsuz sayida paralel evrenden gecerken "
                    + "kendi kaderiyle ilgili zor bir secimle yuzlesir.",
                StartDate = new DateTime(2026, 7, 24, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Animasyon", "Aksiyon" }
            },
            new
            {
                Title = "Coco",
                Duration = (short)105,
                AgeLimit = (short)0,
                Language = "Turkce Dublaj",
                Poster = "https://image.tmdb.org/t/p/w500/f9Ro5x36UTDdHFrhnHeXqlhBVRF.jpg",
                Description = "Muzige tutkun genc bir cocuk, ailesinin gecmisindeki sirri "
                    + "ogrenmek icin oluler diyarina uzanan beklenmedik bir yolculuga cikar.",
                StartDate = new DateTime(2026, 8, 7, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Animasyon", "Dram" }
            },
            new
            {
                Title = "Zootopia",
                Duration = (short)109,
                AgeLimit = (short)0,
                Language = "Turkce Dublaj",
                Poster = "https://image.tmdb.org/t/p/w500/cL6gPwwhcYIGdrpj6vzIaKlb5zQ.jpg",
                Description = "Hayvanlarin bir arada yasadigi modern bir sehirde, hirsli "
                    + "genc bir polis memuru kendini buyuk bir gizemin icinde bulur.",
                StartDate = new DateTime(2026, 8, 21, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 95,
                Genres = new[] { "Animasyon", "Komedi" }
            },
            // --- Yakinda ---
            new
            {
                Title = "Dune: Part Two",
                Duration = (short)165,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/tihf8Trht9zP3scmUQfvGlAY9FU.jpg",
                Description = "Col gezegeninde surgundeki genc bir lider, halkiyla "
                    + "birlikte gelecegini sekillendirecek buyuk bir mucadeleye atilir.",
                StartDate = new DateTime(2026, 9, 25, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Bilim Kurgu", "Aksiyon" }
            },
            new
            {
                Title = "John Wick: Chapter 4",
                Duration = (short)170,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/6jS780bEkQRPLEPWvZ0MGQ0EI4j.jpg",
                Description = "Efsanevi bir suikastci, ozgurlugunu kazanmak icin dunyanin "
                    + "dort bir yanindaki guclu dusmanlarina karsi amansiz bir mucadeleye girer.",
                StartDate = new DateTime(2026, 10, 16, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Aksiyon", "Gerilim" }
            },
            new
            {
                Title = "Deadpool & Wolverine",
                Duration = (short)128,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/fVr2X3jnoeLuZ2v0L1O8MOdOiSz.jpg",
                Description = "Sivri dilli bir kahraman, huysuz bir mutantla zorunlu bir "
                    + "is birligine girerek cok evrenli bir tehlikeye karsi savasir.",
                StartDate = new DateTime(2026, 11, 13, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Aksiyon", "Komedi" }
            },
            new
            {
                Title = "Everything Everywhere All at Once",
                Duration = (short)140,
                AgeLimit = (short)16,
                Language = "Ingilizce",
                Poster = "https://image.tmdb.org/t/p/w500/vt5Fd1wouNEL7HN3TQ0PMls4auE.jpg",
                Description = "Siradan bir kadin, ailesini ve evrenini kurtarmak icin "
                    + "sonsuz paralel yasamlar arasinda sicramayi ogrenir.",
                StartDate = new DateTime(2026, 12, 18, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Bilim Kurgu", "Komedi" }
            }
        };

        var movies = await context.Movies.ToListAsync();

        foreach (var definition in definitions)
        {
            if (movies.Any(m => m.Title == definition.Title))
                continue;

            var movie = new Movie
            {
                Title = definition.Title,
                Duration = definition.Duration,
                Description = definition.Description,
                AgeLimit = definition.AgeLimit,
                Language = definition.Language,
                Poster = definition.Poster,
                StartDate = definition.StartDate,
                EndDate = EndDateFor(definition.StartDate, definition.RunDays),
                AvgScore = 0m
            };

            context.Movies.Add(movie);
            movies.Add(movie);
        }

        await context.SaveChangesAsync();

        var movieGenres = await context.MovieGenres.ToListAsync();

        foreach (var definition in definitions)
        {
            var movie = movies.FirstOrDefault(m => m.Title == definition.Title);
            if (movie is null)
                continue;

            foreach (var genreName in definition.Genres)
            {
                if (!genres.TryGetValue(genreName, out var genre))
                    continue;

                if (movieGenres.Any(mg => mg.MovieId == movie.Id
                                          && mg.GenreId == genre.Id))
                    continue;

                var link = new MovieGenre { MovieId = movie.Id, GenreId = genre.Id };
                context.MovieGenres.Add(link);
                movieGenres.Add(link);
            }
        }

        await context.SaveChangesAsync();

        return movies;
    }

    /// <summary>
    /// Vizyondaki her film icin onumuzdeki 5 gune seans uretir. Gecmis seans
    /// uretilmez: koltuk secimi ekraninda satin alinamayacak bir seans
    /// gormek kafa karistirir.
    /// </summary>
    private static async Task SeedShowtimesAsync(
        ApplicationDbContext context, List<Movie> movies, List<Hall> halls)
    {
        if (halls.Count == 0)
            return;

        // FILM BASINA idempotent. Once "hic seans var mi" diye bakiliyordu;
        // bu, sonradan eklenen ya da vizyon tarihi geriye cekilen bir filmin
        // asla seans almamasi demekti.
        var moviesWithShowtimes = await context.Showtimes
            .Select(showtime => showtime.MovieId)
            .Distinct()
            .ToListAsync();

        var today = DateTimeOffset.UtcNow.Date;
        var startHours = new[] { 11, 14, 17, 20 };

        var releasedMovies = movies
            .Where(movie => movie.StartDate <= DateTime.UtcNow.Date)
            .Where(movie => !moviesWithShowtimes.Contains(movie.Id))
            .ToList();

        if (releasedMovies.Count == 0)
            return;

        var showtimes = new List<Showtime>();
        var hallIndex = 0;

        foreach (var movie in releasedMovies)
        {
            for (var dayOffset = 0; dayOffset < 5; dayOffset++)
            {
                foreach (var hour in startHours)
                {
                    var hall = halls[hallIndex % halls.Count];
                    hallIndex++;

                    var startsAt = new DateTimeOffset(
                        today.AddDays(dayOffset).AddHours(hour),
                        TimeSpan.Zero);

                    // Bugunun gecmis saatleri atlanir.
                    if (startsAt <= DateTimeOffset.UtcNow)
                        continue;

                    showtimes.Add(new Showtime
                    {
                        MovieId = movie.Id,
                        HallId = hall.Id,
                        StartDatetime = startsAt,
                        BasePrice = hour >= 17 ? 260m : 190m,
                        Format = hour == 20
                            ? ScreeningFormat.IMAX
                            : ScreeningFormat.Standard2D
                    });
                }
            }
        }

        await context.Showtimes.AddRangeAsync(showtimes);
        await context.SaveChangesAsync();
    }

    private static async Task SeedCampaignsAsync(ApplicationDbContext context)
    {
        var definitions = new[]
        {
            new Campaign
            {
                Name = "Uyelere Ozel %10",
                Type = CampaignType.Percentage,
                Value = 10m,
                MinCartTotal = 0m,
                MembersOnly = true,
                IsActive = true
            },
            new Campaign
            {
                Name = "500 TL Uzeri 75 TL Indirim",
                Type = CampaignType.FixedAmount,
                Value = 75m,
                MinCartTotal = 500m,
                MembersOnly = false,
                IsActive = true
            }
        };

        var existing = await context.Campaigns.ToListAsync();

        foreach (var campaign in definitions)
        {
            if (existing.Any(c => c.Name == campaign.Name))
                continue;

            context.Campaigns.Add(campaign);
        }

        await context.SaveChangesAsync();
    }
}
