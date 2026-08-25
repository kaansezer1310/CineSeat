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
/// canliya cikildiginda "Neon Yagmuru" diye bir filmin veritabaninda olmasi
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
    /// AFISLER: gercek film afisleri telifli goreseldir, depoya kopyalanmasi
    /// dogru olmaz. public/posters/ altinda ayni adlarla tasarlanmis yer
    /// tutucu afisler var; gercek afis dosyalari ayni adla konursa kod
    /// degismeden calisir.
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
            new
            {
                Title = "Toy Story 5",
                Duration = (short)102,
                AgeLimit = (short)0,
                Language = "Turkce Dublaj",
                Poster = "/posters/toy-story-5.svg",
                Description = "Woody ve Buzz, oyuncaklarin yerini ekranlarin "
                    + "aldigi bir cocuk odasinda yeniden birlesir.",
                StartDate = new DateTime(2026, 6, 19, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 120,
                Genres = new[] { "Animasyon", "Komedi" }
            },
            new
            {
                Title = "The Odyssey",
                Duration = (short)172,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "/posters/the-odyssey.svg",
                Description = "Christopher Nolan'in Homeros uyarlamasi: "
                    + "Odysseus'un Truva sonrasi eve donus yolculugu, "
                    + "bastan sona IMAX 70mm kameralarla cekildi.",
                StartDate = new DateTime(2026, 7, 17, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Dram", "Aksiyon" }
            },
            new
            {
                Title = "Spider-Man: Brand New Day",
                Duration = (short)145,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "/posters/spider-man-brand-new-day.svg",
                Description = "Kendisini kimsenin hatirlamadigi bir dunyada tam "
                    + "zamanli Orumcek Adam olan Peter Parker, eski "
                    + "arkadaslarinin onsuz devam edisiyle yuzlesir.",
                StartDate = new DateTime(2026, 7, 31, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 100,
                Genres = new[] { "Aksiyon", "Bilim Kurgu" }
            },
            new
            {
                Title = "Dune: Part Three",
                Duration = (short)166,
                AgeLimit = (short)13,
                Language = "Ingilizce",
                Poster = "/posters/dune-part-three.svg",
                Description = "Denis Villeneuve'un Frank Herbert uyarlamasinin "
                    + "kapanis bolumu. Paul Atreides'in imparatorlugu ve "
                    + "kehanetin bedeli.",
                // Vizyon tarihi ileride: "Yakinda" sekmesi bos kalmasin.
                StartDate = new DateTime(2026, 12, 18, 0, 0, 0, DateTimeKind.Utc),
                RunDays = 90,
                Genres = new[] { "Bilim Kurgu", "Dram" }
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
