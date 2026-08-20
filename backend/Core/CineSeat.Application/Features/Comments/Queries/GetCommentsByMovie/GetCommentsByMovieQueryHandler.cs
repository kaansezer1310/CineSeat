using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Comments.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Comments.Queries.GetCommentsByMovie;

public class GetCommentsByMovieQueryHandler
    : IRequestHandler<GetCommentsByMovieQuery, PagedResult<CommentDto>>
{
    private readonly ICommentReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetCommentsByMovieQueryHandler(ICommentReadRepository read, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<PagedResult<CommentDto>> Handle(
        GetCommentsByMovieQuery request, CancellationToken cancellationToken)
    {
        var page = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;

        var query = _read.GetWhere(c => c.MovieId == request.MovieId, tracking: false);

        var totalCount = await _queryExecutor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                MovieId = c.MovieId,
                UserId = c.UserId,
                Username = c.User.Username,
                Rating = c.Rating,
                Content = c.Content,
                IsEdited = c.IsEdited,
                CreatedAt = c.CreatedAt
            });

        var items = await _queryExecutor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<CommentDto>(items, totalCount, page, pageSize);
    }
}
