using MediatR;

namespace CineSeat.Application.Features.Comments.Commands.DeleteComment;

public class DeleteCommentCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
