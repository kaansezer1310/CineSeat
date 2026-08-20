using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class PermissionReadRepository : ReadRepository<Permission>, IPermissionReadRepository
{
    public PermissionReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
