using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class RolePermissionReadRepository : ReadRepository<RolePermission>, IRolePermissionReadRepository
{
    public RolePermissionReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
