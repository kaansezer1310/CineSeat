using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class UserFavoriteWriteRepository : WriteRepository<UserFavorite>, IUserFavoriteWriteRepository
{
    public UserFavoriteWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
