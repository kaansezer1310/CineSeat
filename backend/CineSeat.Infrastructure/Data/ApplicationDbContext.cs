using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Kolaylık olsun diye Id kolonları için ek konfigürasyonlar yapılabilir
            // veya Enum'lar için string dönüşümü sağlanabilir.
        }
    }
}
