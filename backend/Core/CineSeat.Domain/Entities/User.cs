using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class User : BaseEntity
    {
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public required string PasswordSalt { get; set; }
        public string? PhoneNum { get; set; }
        public string? Gender { get; set; }

        public long RoleId { get; set; }

        // Zorunlu ilişki: EF Include ile doldurur.
        public Role Role { get; set; } = null!;

        public ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<SeatLock> SeatLocks { get; set; } = new List<SeatLock>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
