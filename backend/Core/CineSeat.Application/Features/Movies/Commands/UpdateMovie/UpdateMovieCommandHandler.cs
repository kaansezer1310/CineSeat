using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Extensions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.UpdateMovie;

public class UpdateMovieCommandHandler : IRequestHandler<UpdateMovieCommand, Unit>
{
    private readonly IMovieReadRepository _read;
    private readonly IMovieWriteRepository _write;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public UpdateMovieCommandHandler(
        IMovieReadRepository read,
        IMovieWriteRepository write,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _write = write;
        _queryExecutor = queryExecutor;
    }

    public async Task<Unit> Handle(UpdateMovieCommand request, CancellationToken cancellationToken)
    {
        var movie = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.Id);

        var startDate = request.StartDate.ToUtc();
        var endDate = request.EndDate.ToUtc();

        // Create'teki kuralın aynısı: aynı ad + vizyon tarihi çifti tekrar edemez.
        // Kendi kaydını çakışma saymamak için Id dışlanıyor.
        var duplicate = _read.GetWhere(
            m => m.Id != request.Id && m.Title == request.Title && m.StartDate == startDate,
            tracking: false);

        if (await _queryExecutor.AnyAsync(duplicate, cancellationToken))
            throw new ConflictException($"'{request.Title}' filmi bu vizyon tarihiyle zaten kayıtlı.");

        movie.Title = request.Title;
        movie.Duration = request.Duration;
        movie.Description = request.Description;
        movie.AgeLimit = request.AgeLimit;
        movie.Language = request.Language;
        movie.Poster = request.Poster;
        movie.StartDate = startDate;
        movie.EndDate = endDate;
        // AvgScore burada GÜNCELLENMEZ — yorumlardan türetilen bir değer.

        _write.Update(movie);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
