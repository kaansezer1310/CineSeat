using CineSeat.Domain.Entities;

namespace CineSeat.Application.Repositories;

// Sadece okuma — kullanıcı oluşturma/hash'leme Ömer'in Auth (Faz 1) işi.
// Burada yalnızca FK doğrulaması (kullanıcı var mı) için kullanılıyor.
public interface IUserReadRepository : IReadRepository<User>
{
}
