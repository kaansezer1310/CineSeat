using CineSeat.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace CineSeat.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<City> Cities { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
