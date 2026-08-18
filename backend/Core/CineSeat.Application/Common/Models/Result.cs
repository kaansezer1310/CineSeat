namespace CineSeat.Application.Common.Models;

/// <summary>
/// Değer döndürmeyen işlemlerin sonucu. Handler'lar beklenen hataları
/// (iş kuralı ihlali gibi) exception fırlatmak yerine bu tiple geri verir.
/// </summary>
public class Result
{
    protected Result(bool isSuccess, string? error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public string? Error { get; }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

/// <summary>
/// Değer döndüren işlemlerin sonucu.
/// </summary>
public class Result<T>
{
    private Result(bool isSuccess, T? value, string? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}
