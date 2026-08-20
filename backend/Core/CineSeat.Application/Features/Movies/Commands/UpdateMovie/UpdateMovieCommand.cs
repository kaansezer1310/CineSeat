using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.UpdateMovie;

public class UpdateMovieCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public short Duration { get; set; }
    public string Description { get; set; } = string.Empty;
    public short AgeLimit { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
