using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class District : BaseEntity
    {
        public string DistrictName { get; set; }

        public long CityId { get; set; }
        public City City { get; set; }

        public ICollection<Cinema> Cinemas { get; set; }
    }
}
