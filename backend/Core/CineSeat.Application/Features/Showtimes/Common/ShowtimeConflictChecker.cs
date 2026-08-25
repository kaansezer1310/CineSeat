using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;

namespace CineSeat.Application.Features.Showtimes.Common;

/// <summary>
/// Ayni salonda cakisan seans acilmasini engeller.
///
/// NEDEN GEREKLI: onceden yalnizca "film ve salon var mi" kontrol ediliyordu.
/// Ayni salona ayni saate iki seans acilabiliyordu; koltuk kilitleri ve
/// rezervasyonlar seans bazli oldugu icin bu, iki farkli filmin ayni koltuklari
/// ayri ayri satmasi demekti.
///
/// Bir seansin salonu isgal ettigi araliğa filmin suresi kadar zaman ve
/// ustune temizlik/giris-cikis payi eklenir.
/// </summary>
public static class ShowtimeConflictChecker
{
    /// <summary>Seans bitisi ile bir sonrakinin baslangici arasindaki asgari bosluk.</summary>
    public const int CleanupMinutes = 20;

    public static async Task EnsureNoConflictAsync(
        IShowtimeReadRepository showtimeRead,
        IMovieReadRepository movieRead,
        IAsyncQueryExecutor executor,
        long hallId,
        DateTimeOffset startsAt,
        short movieDurationMinutes,
        long? excludedShowtimeId,
        CancellationToken cancellationToken)
    {
        var endsAt = startsAt.AddMinutes(movieDurationMinutes + CleanupMinutes);

        // Ayni salondaki diger seanslar. Cakisma penceresi genis tutuluyor:
        // en uzun film bile bu aralikta baslayip bitmis olur.
        var windowStart = startsAt.AddHours(-12);
        var windowEnd = endsAt.AddHours(12);

        var neighbours = await executor.ToListAsync(
            showtimeRead
                .GetWhere(
                    showtime => showtime.HallId == hallId
                                && showtime.StartDatetime >= windowStart
                                && showtime.StartDatetime <= windowEnd,
                    tracking: false)
                .Select(showtime => new
                {
                    showtime.Id,
                    showtime.MovieId,
                    showtime.StartDatetime
                }),
            cancellationToken);

        if (neighbours.Count == 0)
            return;

        // Komsu seanslarin sureleri icin filmleri tek seferde cek.
        var movieIds = neighbours.Select(item => item.MovieId).Distinct().ToList();

        var durations = await executor.ToListAsync(
            movieRead
                .GetWhere(movie => movieIds.Contains(movie.Id), tracking: false)
                .Select(movie => new { movie.Id, movie.Duration }),
            cancellationToken);

        var durationByMovieId = durations.ToDictionary(
            item => item.Id,
            item => item.Duration);

        foreach (var neighbour in neighbours)
        {
            if (excludedShowtimeId.HasValue && neighbour.Id == excludedShowtimeId.Value)
                continue;

            if (!durationByMovieId.TryGetValue(neighbour.MovieId, out var duration))
                continue;

            var neighbourEnd = neighbour.StartDatetime
                .AddMinutes(duration + CleanupMinutes);

            // Yarim acik aralik: bir seans tam olarak digerinin bittigi anda
            // baslayabilir.
            var overlaps = startsAt < neighbourEnd && neighbour.StartDatetime < endsAt;

            if (overlaps)
            {
                throw new ConflictException(
                    $"Bu salonda {neighbour.StartDatetime.ToLocalTime():dd.MM.yyyy HH:mm} " +
                    $"seansiyla cakisiyor. Seanslar arasinda en az {CleanupMinutes} dakika bosluk olmali.");
            }
        }
    }

    /// <summary>Gecmise seans acilmasini engeller.</summary>
    public static void EnsureNotInPast(DateTimeOffset startsAt)
    {
        if (startsAt <= DateTimeOffset.UtcNow)
        {
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(Showtime.StartDatetime),
                    "Seans baslangici gelecekte olmalidir.")
            });
        }
    }
}
