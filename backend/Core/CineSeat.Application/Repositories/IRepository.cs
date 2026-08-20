using CineSeat.Domain.Entities.Common;

namespace CineSeat.Application.Repositories;

/// <summary>
/// Repository ailesinin ortak kökü. Bilinçli olarak ÜYESİZ bir marker interface'tir.
///
/// Eskiden burada <c>DbSet&lt;T&gt; Table { get; }</c> vardı; bu, Application
/// katmanını Microsoft.EntityFrameworkCore'a bağımlı kılıyordu ve Onion mimarisinin
/// "iç halka dış halkayı tanımaz" kuralını ihlal ediyordu. DbSet artık dışarı
/// açılmıyor — ReadRepository/WriteRepository içinde private bir detay.
///
/// Tek işlevi: T'nin BaseEntity olmasını garanti etmek ve DI tarafında tüm
/// repository'leri tek bir tip üzerinden taramaya imkan vermek.
/// </summary>
public interface IRepository<T> where T : BaseEntity
{
}
