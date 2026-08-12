using CineSeat.Domain.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Application.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    DbSet<T> Table { get; }
}
