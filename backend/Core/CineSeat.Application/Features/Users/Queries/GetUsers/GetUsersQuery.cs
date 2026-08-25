using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Users.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Users.Queries.GetUsers;

/// <summary>user.manage iznine sahip yonetim kullanicilari icin kullanici listesi.</summary>
public class GetUsersQuery : IRequest<PagedResult<UserSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    /// <summary>Ad, soyad, kullanici adi veya e-postada gecen metin.</summary>
    public string? Search { get; set; }

    public long? RoleId { get; set; }
}
