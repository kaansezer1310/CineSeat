using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class TicketReadRepository : ReadRepository<Ticket>, ITicketReadRepository
{
    public TicketReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
