using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities.Common;
using CineSeat.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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
        if (model.IsDeleted)
            return false;

        model.IsDeleted = true;
        var entityEntry = Table.Update(model);
        return entityEntry.State == EntityState.Modified;
    }

    public bool RemoveRange(List<T> datas)
    {
        foreach (var model in datas)
            model.IsDeleted = true;

        Table.UpdateRange(datas);
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

    // Bağlantı/geçici tablolarda (favori, koltuk kilidi, eşleme tabloları)
    // soft-delete benzersiz indexleri bloke eder. Bu metot yalnızca o açıkça
    // belirlenmiş yaşam döngüleri için kullanılmalıdır.
    public bool HardDelete(T model)
    {
        var entityEntry = Table.Remove(model);
        return entityEntry.State == EntityState.Deleted;
    }

    public bool HardDeleteRange(List<T> datas)
    {
        Table.RemoveRange(datas);
        return true;
    }

    public async Task<bool> HardDeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var model = await Table
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(data => data.Id == id, cancellationToken);
        return model is not null && HardDelete(model);
    }

    public async Task<bool> RestoreAsync(long id, CancellationToken cancellationToken = default)
    {
        var model = await Table
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(data => data.Id == id, cancellationToken);

        if (model is null || !model.IsDeleted)
            return false;

        model.IsDeleted = false;
        var entityEntry = Table.Update(model);
        return entityEntry.State == EntityState.Modified;
    }

    public bool Update(T model)
    {
        var entityEntry = Table.Update(model);
        return entityEntry.State == EntityState.Modified;
    }

    // PostgreSQL'in benzersiz kisit ihlali icin kullandigi SQLSTATE kodu.
    private const string UniqueViolation = "23505";

    /// <summary>
    /// Degisiklikleri yazar. Benzersiz kisit ihlali <see cref="ConflictException"/>
    /// olarak yeniden firlatilir.
    ///
    /// Handler'lar yazmadan once "bu kayit var mi" diye bakiyor, ancak okuma ile
    /// yazma arasinda baska bir istek ayni satiri ekleyebiliyor. O yaris
    /// kaybedildiginde veritabani dogru davranip islemi reddediyordu, fakat
    /// cagirana 500 donuyordu; oysa bu beklenen bir durum ve 409'un ta kendisi.
    /// Ceviri burada yapiliyor: EF'i yalnizca bu katman taniyor.
    /// </summary>
    public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException { SqlState: UniqueViolation })
        {
            throw new ConflictException(
                "Bu kayit baska bir islem tarafindan olusturulmus. Lutfen tekrar deneyin.");
        }
    }
}
