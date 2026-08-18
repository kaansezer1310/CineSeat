using CineSeat.Domain.Entities.Common;
using System.Linq.Expressions;

namespace CineSeat.Application.Repositories;

/// <summary>
/// Okuma tarafı sözleşmesi. Dönen <see cref="IQueryable{T}"/> ve
/// <see cref="Expression{TDelegate}"/> tipleri System.Linq'e aittir; ORM'e değil.
/// Sorguyu materyalize etmek (ToList/Count/Any) için
/// <see cref="Common.Interfaces.IAsyncQueryExecutor"/> kullanılır.
/// </summary>
public interface IReadRepository<T> : IRepository<T> where T : BaseEntity
{
    IQueryable<T> GetAll(bool tracking = true);
    IQueryable<T> GetWhere(Expression<Func<T, bool>> method, bool tracking = true);
    Task<T?> GetSingleAsync(Expression<Func<T, bool>> method, bool tracking = true, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(long id, bool tracking = true, CancellationToken cancellationToken = default);
}
