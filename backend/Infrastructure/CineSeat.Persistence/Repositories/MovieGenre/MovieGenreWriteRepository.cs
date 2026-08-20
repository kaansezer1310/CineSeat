using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class MovieGenreWriteRepository : WriteRepository<MovieGenre>, IMovieGenreWriteRepository
{
    public MovieGenreWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
