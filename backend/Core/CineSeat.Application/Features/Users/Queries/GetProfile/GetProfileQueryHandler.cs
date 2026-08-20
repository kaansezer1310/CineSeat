using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Users.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Users.Queries.GetProfile;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserProfileDto>
{
    private readonly IUserReadRepository _read;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetProfileQueryHandler(
        IUserReadRepository read, ICurrentUserService currentUser, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<UserProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var profile = await _queryExecutor.FirstOrDefaultAsync(
            _read.GetWhere(u => u.Id == userId, tracking: false)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Surname = u.Surname,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNum = u.PhoneNum,
                    Gender = u.Gender,
                    Role = u.Role.Name,
                    MemberSince = u.CreatedAt
                }),
            cancellationToken);

        if (profile is null)
            throw new NotFoundException("Kullanıcı", userId);

        return profile;
    }
}
