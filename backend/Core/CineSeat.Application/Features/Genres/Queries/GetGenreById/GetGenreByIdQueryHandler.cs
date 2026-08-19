using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Genres.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Genres.Queries.GetGenreById;

public class GetGenreByIdQueryHandler : IRequestHandler<GetGenreByIdQuery, GenreDto>
{
    private readonly IGenreReadRepository _read;

    public GetGenreByIdQueryHandler(IGenreReadRepository read) => _read = read;

    public async Task<GenreDto> Handle(GetGenreByIdQuery request, CancellationToken cancellationToken)
    {
        var genre = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (genre is null)
            throw new NotFoundException("Tür", request.Id);

        return new GenreDto { Id = genre.Id, Name = genre.Name };
    }
}
