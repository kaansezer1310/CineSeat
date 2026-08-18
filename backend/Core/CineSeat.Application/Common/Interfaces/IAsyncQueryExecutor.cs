namespace CineSeat.Application.Common.Interfaces;

/// <summary>
/// Bir <see cref="IQueryable{T}"/>'i asenkron olarak çalıştıran soyutlama.
///
/// NEDEN VAR: <c>ToListAsync</c>, <c>CountAsync</c>, <c>AnyAsync</c> gibi metotlar
/// LINQ'in değil, Microsoft.EntityFrameworkCore paketinin extension metotlarıdır.
/// Handler'lar bunları doğrudan çağırdığında Application katmanı EF Core'a
/// bağımlı hale gelir. Bu arayüz o bağımlılığı Persistence katmanına hapseder:
/// Application "sorguyu asenkron çalıştır" der, "EF ile çalıştır" demez.
///
/// Implementasyon: CineSeat.Persistence.Data.EfAsyncQueryExecutor
/// </summary>
public interface IAsyncQueryExecutor
{
    Task<List<T>> ToListAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
    Task<int> CountAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync<T>(IQueryable<T> query, CancellationToken cancellationToken = default);
}
