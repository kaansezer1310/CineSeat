namespace CineSeat.Application.Common.Extensions;

public static class DateTimeExtensions
{
    /// <summary>
    /// PostgreSQL'de tarih kolonları "timestamp with time zone" tipinde; Npgsql
    /// bu kolonlara Kind'ı Utc olmayan DateTime yazılmasına izin vermez.
    /// JSON'dan gelen tarihler Unspecified geldiği için UTC'ye sabitliyoruz.
    /// </summary>
    public static DateTime ToUtc(this DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
