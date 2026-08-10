using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserFavorite> UserFavorites { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<MovieGenre> MovieGenres { get; set; }
        public DbSet<Technology> Technologies { get; set; }
        public DbSet<HallTech> HallTechs { get; set; }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<District> Districts { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Hall> Halls { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<SeatLock> SeatLocks { get; set; }
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique Constraints (UKs)
            modelBuilder.Entity<UserFavorite>()
                .HasIndex(uf => new { uf.UserId, uf.MovieId })
                .IsUnique();

            modelBuilder.Entity<MovieGenre>()
                .HasIndex(mg => new { mg.MovieId, mg.GenreId })
                .IsUnique();

            modelBuilder.Entity<Genre>()
                .HasIndex(g => g.Name)
                .IsUnique();

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => r.ResNo)
                .IsUnique();

            // Kimlik alanları benzersiz olmalı — aynı e-posta/kullanıcı adıyla
            // iki kez kayıt olunamaz (auth güvenliği).
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Eşzamanlılık kilidi: aynı seans+koltuk yalnızca bir kez
            // kilitlenebilir (iki kullanıcının aynı koltuğu aynı anda
            // rezerve etmesini veritabanı seviyesinde engeller).
            modelBuilder.Entity<SeatLock>()
                .HasIndex(sl => new { sl.ShowtimeId, sl.SeatId })
                .IsUnique();

            // Decimal Precision Configurations
            modelBuilder.Entity<Movie>()
                .Property(m => m.AvgScore)
                .HasPrecision(3, 2);

            modelBuilder.Entity<Cinema>()
                .Property(c => c.Latitude)
                .HasPrecision(19, 10);

            modelBuilder.Entity<Cinema>()
                .Property(c => c.Longitude)
                .HasPrecision(19, 10);

            modelBuilder.Entity<Showtime>()
                .Property(s => s.BasePrice)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Campaign>()
                .Property(c => c.Value)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Campaign>()
                .Property(c => c.MinCartTotal)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Subtotal)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Discount)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Reservation>()
                .Property(r => r.Total)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Price)
                .HasPrecision(10, 2);
        }
    }
}
