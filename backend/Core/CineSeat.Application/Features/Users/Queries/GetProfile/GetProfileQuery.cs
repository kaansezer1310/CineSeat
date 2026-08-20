using CineSeat.Application.Features.Users.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Users.Queries.GetProfile;

/// <summary>Giriş yapmış kullanıcının kendi profili — id parametresi almaz.</summary>
public class GetProfileQuery : IRequest<UserProfileDto>
{
}
