using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class TicketWriteRepository : WriteRepository<Ticket>, ITicketWriteRepository
{
    public TicketWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
