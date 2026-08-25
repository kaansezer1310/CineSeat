using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class UserFavorite : BaseEntity
    {
        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public long MovieId { get; set; }
        public Movie Movie { get; set; } = null!;
    }
}
