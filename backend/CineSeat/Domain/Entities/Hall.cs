using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class Hall : BaseEntity
    {
        public string Name { get; set; }

        public long CinemaId { get; set; }
        public Cinema Cinema { get; set; }

        public ICollection<HallTech> HallTechs { get; set; }
        public ICollection<Showtime> Showtimes { get; set; }
        public ICollection<Seat> Seats { get; set; }
    }
}
