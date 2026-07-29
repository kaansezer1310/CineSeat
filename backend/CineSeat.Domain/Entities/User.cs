using CineSeat.Domain.Entities.Common;

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

        public long RoleId { get; set; }   // düz sütun kalır — FK kısıtı yok, sorun değil
    }
}