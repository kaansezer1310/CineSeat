using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class HallTech : BaseEntity
    {
        public long TechnologyId { get; set; }
        public Technology Technology { get; set; } = null!;

        public long HallId { get; set; }
        public Hall Hall { get; set; } = null!;
    }
}
