using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class UserFavoriteReadRepository : ReadRepository<UserFavorite>, IUserFavoriteReadRepository
{
    public UserFavoriteReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
