using CineSeat.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CineSeat.Persistence.Data;

/// <summary>
/// IAsyncQueryExecutor'ın EF Core implementasyonu.
///
/// Application katmanındaki handler'lar artık ToListAsync/CountAsync/AnyAsync
/// extension metotlarını doğrudan çağırmıyor; o çağrılar buraya taşındı.
/// Böylece Microsoft.EntityFrameworkCore bağımlılığı Persistence katmanında kalıyor.
/// </summary>
public sealed class EfAsyncQueryExecutor : IAsyncQueryExecutor
{
    public Task<List<T>> ToListAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        => query.ToListAsync(cancellationToken);

    public Task<int> CountAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        => query.CountAsync(cancellationToken);

    public Task<bool> AnyAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        => query.AnyAsync(cancellationToken);

    public Task<T?> FirstOrDefaultAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default)
        => query.FirstOrDefaultAsync(cancellationToken);
}
