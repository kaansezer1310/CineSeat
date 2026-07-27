using System;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Movie : BaseEntity
    {
        public string Title { get; set; }
        public short Duration { get; set; }
        public string Description { get; set; }
        public short AgeLimit { get; set; }
        public string Language { get; set; }
        public string Poster { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Derived alan (yorumlar üzerinden hesaplanacak)
        public decimal AvgScore { get; set; }

    }
}
