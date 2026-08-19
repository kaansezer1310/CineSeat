using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.CreateCampaign;

public class CreateCampaignCommandHandler : IRequestHandler<CreateCampaignCommand, long>
{
    private readonly ICampaignReadRepository _read;
    private readonly ICampaignWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public CreateCampaignCommandHandler(
        ICampaignReadRepository read, ICampaignWriteRepository write, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<long> Handle(CreateCampaignCommand request, CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();

        var exists = await _queryExecutor.AnyAsync(
            _read.GetWhere(c => c.Name.ToLower() == name.ToLower(), tracking: false), cancellationToken);
        if (exists)
            throw new ConflictException($"'{name}' adında bir kampanya zaten var.");

        var campaign = new Campaign
        {
            Name = name,
            Type = request.Type,
            Value = request.Value,
            MinCartTotal = request.MinCartTotal,
            MembersOnly = request.MembersOnly,
            IsActive = request.IsActive
        };

        await _write.AddAsync(campaign, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return campaign.Id;
    }
}
