using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Users.DTOs;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Users.Queries.GetUsers;

public class GetUsersQueryHandler
    : IRequestHandler<GetUsersQuery, PagedResult<UserSummaryDto>>
{
    private readonly IUserReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetUsersQueryHandler(IUserReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<UserSummaryDto>> Handle(
        GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();

            query = query.Where(user =>
                user.Name.ToLower().Contains(search)
                || user.Surname.ToLower().Contains(search)
                || user.Username.ToLower().Contains(search)
                || user.Email.ToLower().Contains(search));
        }

        if (request.RoleId.HasValue)
            query = query.Where(user => user.RoleId == request.RoleId.Value);

        var totalCount = await _executor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderBy(user => user.Username)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(user => new UserSummaryDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                PhoneNum = user.PhoneNum,
                RoleId = user.RoleId,
                RoleName = user.Role.Name,
                MemberSince = user.CreatedAt,
                // Iptal edilenler "kullanici kac bilet aldi" sorusunun cevabi degil.
                ReservationCount = user.Reservations
                    .Count(reservation => reservation.Status != ReservationStatus.Cancelled)
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<UserSummaryDto>(
            items, totalCount, request.PageNumber, request.PageSize);
    }
}
