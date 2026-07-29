using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Technology : BaseEntity
    {
        public string Name { get; set; }

        public ICollection<HallTech> HallTechs { get; set; }
    }
}
