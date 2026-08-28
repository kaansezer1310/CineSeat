using FluentValidation;

namespace CineSeat.Application.Features.Comments.Queries.GetCommentsByMovie;

public class GetCommentsByMovieQueryValidator : AbstractValidator<GetCommentsByMovieQuery>
{
    public GetCommentsByMovieQueryValidator()
    {
        RuleFor(x => x.MovieId).GreaterThan(0);
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
