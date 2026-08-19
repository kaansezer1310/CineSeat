using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CommentWriteRepository : WriteRepository<Comment>, ICommentWriteRepository
{
    public CommentWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
