using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class MovieReadRepository : ReadRepository<Movie>, IMovieReadRepository
{
    public MovieReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
