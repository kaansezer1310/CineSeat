using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class Cinema : BaseEntity
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }

        public long DistrictId { get; set; }
        public District District { get; set; }

        public ICollection<Hall> Halls { get; set; }
    }
}
