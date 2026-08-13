using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string PasswordSalt { get; set; }
        public string? PhoneNum { get; set; }
        public string? Gender { get; set; }

        public long RoleId { get; set; }
        public Role Role { get; set; }

        public ICollection<UserFavorite> UserFavorites { get; set; }
        public ICollection<Comment> Comments { get; set; }
        public ICollection<SeatLock> SeatLocks { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
    }
}