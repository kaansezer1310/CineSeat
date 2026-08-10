using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class City : BaseEntity
    {
        public string CityName { get; set; }

        public ICollection<District> Districts { get; set; }
    }
}
