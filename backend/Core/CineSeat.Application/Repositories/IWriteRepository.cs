using CineSeat.Domain.Entities.Common;

namespace CineSeat.Application.Repositories;

/// <summary>
/// Yazma tarafı sözleşmesi. Hiçbir üyesi ORM tipi içermez.
/// </summary>
public interface IWriteRepository<T> : IRepository<T> where T : BaseEntity
{
    Task<bool> AddAsync(T model, CancellationToken cancellationToken = default);
    Task<bool> AddRangeAsync(List<T> datas, CancellationToken cancellationToken = default);
    bool Remove(T model);
    bool RemoveRange(List<T> datas);
    Task<bool> RemoveAsync(long id, CancellationToken cancellationToken = default);
    bool HardDelete(T model);
    bool HardDeleteRange(List<T> datas);
    Task<bool> HardDeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> RestoreAsync(long id, CancellationToken cancellationToken = default);
    bool Update(T model);

    /// <summary>
    /// Kaydi izleyiciden cikarir. Basarisiz bir yazmadan sonra bekleyen
    /// degisiklik izleyicide kalir ve bir sonraki SaveAsync onu yeniden
    /// denerdi; devralma gibi telafi yollarinda bu gerekli.
    /// </summary>
    void Detach(T model);

    Task<int> SaveAsync(CancellationToken cancellationToken = default);
}
