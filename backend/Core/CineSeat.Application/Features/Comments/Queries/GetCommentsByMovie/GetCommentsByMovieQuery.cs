using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Comments.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Comments.Queries.GetCommentsByMovie;

public class GetCommentsByMovieQuery : IRequest<PagedResult<CommentDto>>
{
    public long MovieId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
