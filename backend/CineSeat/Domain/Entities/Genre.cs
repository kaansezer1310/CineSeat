using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class Genre : BaseEntity
    {
        public string Name { get; set; }

        public ICollection<MovieGenre> MovieGenres { get; set; }
    }
}
