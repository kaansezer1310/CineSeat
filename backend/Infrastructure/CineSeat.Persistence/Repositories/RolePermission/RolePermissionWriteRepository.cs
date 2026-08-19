using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class RolePermissionWriteRepository : WriteRepository<RolePermission>, IRolePermissionWriteRepository
{
    public RolePermissionWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
