using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities.Common;
using CineSeat.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Persistence.Repositories;

public class WriteRepository<T> : IWriteRepository<T> where T : BaseEntity
{
    private readonly ApplicationDbContext _context;

    public WriteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // DbSet artık DIŞARI AÇILMIYOR — bkz. ReadRepository'deki not.
    protected DbSet<T> Table => _context.Set<T>();

    public async Task<bool> AddAsync(T model, CancellationToken cancellationToken = default)
    {
        var entityEntry = await Table.AddAsync(model, cancellationToken);
        return entityEntry.State == EntityState.Added;
    }

    public async Task<bool> AddRangeAsync(List<T> datas, CancellationToken cancellationToken = default)
    {
        await Table.AddRangeAsync(datas, cancellationToken);
        return true;
    }

    public bool Remove(T model)
    {
        var entityEntry = Table.Remove(model);
        return entityEntry.State == EntityState.Deleted;
    }

    public bool RemoveRange(List<T> datas)
    {
        Table.RemoveRange(datas);
        return true;
    }

    public async Task<bool> RemoveAsync(long id, CancellationToken cancellationToken = default)
    {
        // Eski hali string id alıp long.Parse ediyordu; geçersiz bir id
        // FormatException fırlatıyor, bulunamayan kayıt ise Remove(null)
        // ile NullReferenceException'a yol açıyordu. İkisi de kapatıldı.
        T? model = await Table.FirstOrDefaultAsync(data => data.Id == id, cancellationToken);
        return model is not null && Remove(model);
    }

    public bool Update(T model)
    {
        var entityEntry = Table.Update(model);
        return entityEntry.State == EntityState.Modified;
    }

    public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);
}
