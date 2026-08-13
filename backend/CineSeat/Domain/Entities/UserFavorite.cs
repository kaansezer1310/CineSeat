using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class UserFavorite : BaseEntity
    {
        public long UserId { get; set; }
        public User User { get; set; }

        public long MovieId { get; set; }
        public Movie Movie { get; set; }
    }
}
