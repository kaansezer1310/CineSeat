using CineSeat.Application.Features.Districts.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Districts.Queries.GetDistrictsByCity;

public class GetDistrictsByCityQuery : IRequest<List<DistrictDto>>
{
    /// <summary>
    /// Şehir süzgeci. Boş bırakılırsa tüm ilçeler döner.
    /// </summary>
    public long? CityId { get; set; }
}
