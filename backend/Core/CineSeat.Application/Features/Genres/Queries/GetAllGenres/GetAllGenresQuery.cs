using CineSeat.Application.Features.Genres.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Genres.Queries.GetAllGenres;

/// <summary>
/// Tür sayısı doğası gereği küçük (onlarca), sayfalama eklenmedi.
/// </summary>
public class GetAllGenresQuery : IRequest<List<GenreDto>>
{
}
