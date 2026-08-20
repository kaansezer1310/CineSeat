using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class MovieWriteRepository : WriteRepository<Movie>, IMovieWriteRepository
{
    public MovieWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
