using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class District : BaseEntity
    {
        public required string DistrictName { get; set; }

        public long CityId { get; set; }
        public City City { get; set; } = null!;

        public ICollection<Cinema> Cinemas { get; set; } = new List<Cinema>();
    }
}
