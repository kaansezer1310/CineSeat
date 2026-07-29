using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class HallTech : BaseEntity
    {
        public long TechId { get; set; }
        public Technology Technology { get; set; }

        public long HallId { get; set; }
        public Hall Hall { get; set; }
    }
}
