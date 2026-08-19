using MediatR;

namespace CineSeat.Application.Features.Genres.Commands.DeleteGenre;

public class DeleteGenreCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
