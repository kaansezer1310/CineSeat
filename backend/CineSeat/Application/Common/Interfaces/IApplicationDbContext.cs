using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Application.Common.Interfaces
{
    /// <summary>
    /// Application katmanının veritabanına baktığı tek pencere.
    /// Handler'lar somut <c>ApplicationDbContext</c>'i değil bu arayüzü enjekte eder;
    /// böylece Application → Infrastructure bağımlılığı hiç oluşmaz (Onion kuralı).
    /// Arayüz Application'da tanımlanır, Infrastructure onu uygular —
    /// bağımlılık okunun tersine çevrilmesi (Dependency Inversion) tam olarak budur.
    /// </summary>
    public interface IApplicationDbContext
    {
        DbSet<Role> Roles { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<User> Users { get; }
        DbSet<UserFavorite> UserFavorites { get; }
        DbSet<Movie> Movies { get; }
        DbSet<Comment> Comments { get; }
        DbSet<Genre> Genres { get; }
        DbSet<MovieGenre> MovieGenres { get; }
        DbSet<Technology> Technologies { get; }
        DbSet<HallTech> HallTechs { get; }
        DbSet<Cinema> Cinemas { get; }
        DbSet<District> Districts { get; }
        DbSet<City> Cities { get; }
        DbSet<Hall> Halls { get; }
        DbSet<Showtime> Showtimes { get; }
        DbSet<Seat> Seats { get; }
        DbSet<SeatLock> SeatLocks { get; }
        DbSet<Campaign> Campaigns { get; }
        DbSet<Reservation> Reservations { get; }
        DbSet<Ticket> Tickets { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
