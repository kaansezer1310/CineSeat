using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.CreateGenre;

public class CreateGenreCommand : IRequest<long>
{
    public string Name { get; set; } = string.Empty;
}
