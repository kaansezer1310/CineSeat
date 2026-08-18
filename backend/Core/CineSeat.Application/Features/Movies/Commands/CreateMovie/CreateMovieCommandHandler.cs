using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.CreateMovie;

/// <summary>
/// Komutu gerçekten çalıştıran yer. Dikkat: burada
/// - tek satır doğrulama kodu yok (ValidationBehavior hallediyor),
/// - tek satır try/catch yok (ExceptionHandlingMiddleware hallediyor),
/// - DbContext yok (IMovieRead/WriteRepository üzerinden gidiliyor).
/// Geriye sadece iş kuralı kalıyor.
/// </summary>
public class CreateMovieCommandHandler : IRequestHandler<CreateMovieCommand, Result<long>>
{
    private readonly IMovieWriteRepository _movieWriteRepository;
    private readonly IMovieReadRepository _movieReadRepository;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public CreateMovieCommandHandler(
        IMovieWriteRepository movieWriteRepository,
        IMovieReadRepository movieReadRepository,
        IAsyncQueryExecutor queryExecutor)
    {
        _movieWriteRepository = movieWriteRepository;
        _movieReadRepository = movieReadRepository;
        _queryExecutor = queryExecutor;
    }

    public async Task<Result<long>> Handle(CreateMovieCommand request, CancellationToken cancellationToken)
    {
        var startDate = ToUtc(request.StartDate);
        var endDate = ToUtc(request.EndDate);

        // İş kuralı: aynı isimde ve aynı vizyon tarihinde ikinci bir film açılamaz.
        var existingQuery = _movieReadRepository
            .GetWhere(m => m.Title == request.Title && m.StartDate == startDate, tracking: false);

        var alreadyExists = await _queryExecutor.AnyAsync(existingQuery, cancellationToken);

        if (alreadyExists)
        {
            return Result<long>.Failure($"'{request.Title}' filmi bu vizyon tarihiyle zaten kayıtlı.");
        }

        var movie = new Movie
        {
            Title = request.Title,
            Duration = request.Duration,
            Description = request.Description,
            AgeLimit = request.AgeLimit,
            Language = request.Language,
            Poster = request.Poster,
            StartDate = startDate,
            EndDate = endDate,
            AvgScore = 0m
            // CreatedAt burada set EDİLMİYOR — AuditableEntityInterceptor dolduruyor.
        };

        await _movieWriteRepository.AddAsync(movie, cancellationToken);
        await _movieWriteRepository.SaveAsync(cancellationToken);

        return Result<long>.Success(movie.Id);
    }

    /// <summary>
    /// PostgreSQL'de start_date/end_date "timestamp with time zone" tipinde;
    /// Npgsql bu kolonlara Kind'ı Utc olmayan DateTime yazılmasına izin vermez.
    /// JSON'dan gelen tarihler Unspecified geldiği için burada UTC'ye sabitliyoruz.
    /// </summary>
    private static DateTime ToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
