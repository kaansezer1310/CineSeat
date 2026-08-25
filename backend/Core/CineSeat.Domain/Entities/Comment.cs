using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Comment : BaseEntity
    {
        public long MovieId { get; set; }
        public Movie Movie { get; set; } = null!;

        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public short Rating { get; set; }
        public required string Content { get; set; }
        public bool IsEdited { get; set; }
    }
}
