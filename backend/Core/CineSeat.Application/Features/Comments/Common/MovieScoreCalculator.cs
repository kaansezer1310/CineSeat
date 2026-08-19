using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;

namespace CineSeat.Application.Features.Comments.Common;

/// <summary>
/// Movie.AvgScore'u yorumlardan yeniden hesaplar. Yorum eklendiğinde ve
/// silindiğinde aynı mantık gerektiği için tek yerde toplandı.
/// </summary>
public static class MovieScoreCalculator
{
    public static async Task<decimal> CalculateAsync(
        ICommentReadRepository commentRead,
        IAsyncQueryExecutor queryExecutor,
        long movieId,
        CancellationToken cancellationToken)
    {
        // GroupBy + Select tek satır döndürür ve tamamen SQL'de çalışır;
        // bütün yorumları belleğe çekip ortalama almaktan çok daha ucuz.
        var stats = await queryExecutor.FirstOrDefaultAsync(
            commentRead.GetWhere(c => c.MovieId == movieId, tracking: false)
                .GroupBy(c => c.MovieId)
                .Select(g => new { Count = g.Count(), Sum = g.Sum(x => (int)x.Rating) }),
            cancellationToken);

        if (stats is null || stats.Count == 0)
            return 0m;

        // AvgScore kolonu precision(3,2); fazla basamak Npgsql tarafında hataya yol açar.
        return Math.Round((decimal)stats.Sum / stats.Count, 2, MidpointRounding.AwayFromZero);
    }
}
