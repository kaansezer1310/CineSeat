using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CampaignReadRepository : ReadRepository<Campaign>, ICampaignReadRepository
{
    public CampaignReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
