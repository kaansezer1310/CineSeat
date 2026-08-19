using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class GenreWriteRepository : WriteRepository<Genre>, IGenreWriteRepository
{
    public GenreWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
