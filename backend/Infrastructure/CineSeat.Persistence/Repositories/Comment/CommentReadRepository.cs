using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CommentReadRepository : ReadRepository<Comment>, ICommentReadRepository
{
    public CommentReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
