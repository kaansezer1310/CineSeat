using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Hall : BaseEntity
    {
        public required string Name { get; set; }

        public long CinemaId { get; set; }
        public Cinema Cinema { get; set; } = null!;

        public ICollection<HallTech> HallTechs { get; set; } = new List<HallTech>();
        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
        public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    }
}
