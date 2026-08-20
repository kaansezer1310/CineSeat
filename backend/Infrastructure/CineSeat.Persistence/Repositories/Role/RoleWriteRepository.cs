using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class RoleWriteRepository : WriteRepository<Role>, IRoleWriteRepository
{
    public RoleWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
