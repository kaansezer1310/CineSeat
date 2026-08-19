using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class GenreReadRepository : ReadRepository<Genre>, IGenreReadRepository
{
    public GenreReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
