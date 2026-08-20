using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CampaignWriteRepository : WriteRepository<Campaign>, ICampaignWriteRepository
{
    public CampaignWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
