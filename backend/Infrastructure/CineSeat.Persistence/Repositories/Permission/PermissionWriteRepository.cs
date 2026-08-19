using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class PermissionWriteRepository : WriteRepository<Permission>, IPermissionWriteRepository
{
    public PermissionWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
