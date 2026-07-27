using System;
using System.Collections.Generic;
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

        // Navigation Properties
        public virtual ICollection<MovieGenre> MovieGenres { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Showtime> Showtimes { get; set; }
        public virtual ICollection<UserFavorites> UserFavorites { get; set; }

        public Movie()
        {
            MovieGenres = new HashSet<MovieGenre>();
            Comments = new HashSet<Comment>();
            Showtimes = new HashSet<Showtime>();
            UserFavorites = new HashSet<UserFavorites>();
        }
    }
}
