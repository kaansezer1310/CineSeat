using MediatR;

namespace CineSeat.Application.Features.Comments.Commands.AddComment;

/// <summary>
/// Filme puanlı yorum ekler. UserId istekle GELMEZ — ICurrentUserService'ten okunur.
/// </summary>
public class AddCommentCommand : IRequest<long>
{
    public long MovieId { get; set; }
    public short Rating { get; set; }
    public string Content { get; set; } = string.Empty;
}
