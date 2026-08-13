using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class Comment : BaseEntity
    {
        public long MovieId { get; set; }
        public Movie Movie { get; set; }

        public long UserId { get; set; }
        public User User { get; set; }

        public short Rating { get; set; }
        public string Content { get; set; }
        public bool IsEdited { get; set; }
    }
}
