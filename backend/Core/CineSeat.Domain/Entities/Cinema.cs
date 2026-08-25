using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Cinema : BaseEntity
    {
        public required string Name { get; set; }
        public required string Address { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }

        public long DistrictId { get; set; }
        public District District { get; set; } = null!;

        public ICollection<Hall> Halls { get; set; } = new List<Hall>();
    }
}
