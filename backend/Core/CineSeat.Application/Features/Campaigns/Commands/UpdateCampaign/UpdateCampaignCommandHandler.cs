using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.UpdateCampaign;

public class UpdateCampaignCommandHandler : IRequestHandler<UpdateCampaignCommand, Unit>
{
    private readonly ICampaignReadRepository _read;
    private readonly ICampaignWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public UpdateCampaignCommandHandler(
        ICampaignReadRepository read, ICampaignWriteRepository write, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(UpdateCampaignCommand request, CancellationToken cancellationToken)
    {
        var campaign = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (campaign is null)
            throw new NotFoundException("Kampanya", request.Id);

        var name = request.Name.Trim();

        var duplicate = await _queryExecutor.AnyAsync(
            _read.GetWhere(c => c.Id != request.Id && c.Name.ToLower() == name.ToLower(), tracking: false),
            cancellationToken);
        if (duplicate)
            throw new ConflictException($"'{name}' adında bir kampanya zaten var.");

        campaign.Name = name;
        campaign.Type = request.Type;
        campaign.Value = request.Value;
        campaign.MinCartTotal = request.MinCartTotal;
        campaign.MembersOnly = request.MembersOnly;
        campaign.IsActive = request.IsActive;

        _write.Update(campaign);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
