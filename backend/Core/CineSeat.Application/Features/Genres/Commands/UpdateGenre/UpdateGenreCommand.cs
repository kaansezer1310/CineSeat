using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.UpdateGenre;

public class UpdateGenreCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
