using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class MovieGenreReadRepository : ReadRepository<MovieGenre>, IMovieGenreReadRepository
{
    public MovieGenreReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
