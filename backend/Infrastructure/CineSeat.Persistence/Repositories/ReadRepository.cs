using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities.Common;
using CineSeat.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CineSeat.Persistence.Repositories;

public class ReadRepository<T> : IReadRepository<T> where T : BaseEntity
{
    private readonly ApplicationDbContext _context;

    public ReadRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // DbSet artık DIŞARI AÇILMIYOR: bu bir EF Core tipi ve Application
    // katmanının onu görmemesi gerekiyor. Türetilmiş repository'ler
    // ihtiyaç duyarsa protected erişimle kullanabilir.
    protected DbSet<T> Table => _context.Set<T>();

    public IQueryable<T> GetAll(bool tracking = true)
    {
        var query = Table.AsQueryable();
        if (!tracking)
            query = query.AsNoTracking();
        return query;
    }

    public IQueryable<T> GetWhere(Expression<Func<T, bool>> method, bool tracking = true)
    {
        var query = Table.Where(method);
        if (!tracking)
            query = query.AsNoTracking();
        return query;
    }

    public async Task<T?> GetSingleAsync(
        Expression<Func<T, bool>> method,
        bool tracking = true,
        CancellationToken cancellationToken = default)
    {
        var query = Table.AsQueryable();
        if (!tracking)
            query = query.AsNoTracking();
        return await query.FirstOrDefaultAsync(method, cancellationToken);
    }

    public async Task<T?> GetByIdAsync(
        long id,
        bool tracking = true,
        CancellationToken cancellationToken = default)
    {
        var query = Table.AsQueryable();
        if (!tracking)
            query = query.AsNoTracking();
        return await query.FirstOrDefaultAsync(data => data.Id == id, cancellationToken);
    }
}
