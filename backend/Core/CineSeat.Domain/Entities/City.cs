using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class City : BaseEntity
    {
        public required string CityName { get; set; }

        public ICollection<District> Districts { get; set; } = new List<District>();
    }
}
