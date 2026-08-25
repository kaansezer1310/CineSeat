using System;
using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class Movie : BaseEntity
    {
        public required string Title { get; set; }
        public short Duration { get; set; }
        public required string Description { get; set; }
        public short AgeLimit { get; set; }
        public required string Language { get; set; }
        public required string Poster { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal AvgScore { get; set; }

        public ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}
