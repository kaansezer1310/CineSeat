using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class UserReadRepository : ReadRepository<User>, IUserReadRepository
{
    public UserReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
