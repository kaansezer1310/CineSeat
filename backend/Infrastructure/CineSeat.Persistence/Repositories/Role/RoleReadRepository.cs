using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class RoleReadRepository : ReadRepository<Role>, IRoleReadRepository
{
    public RoleReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
