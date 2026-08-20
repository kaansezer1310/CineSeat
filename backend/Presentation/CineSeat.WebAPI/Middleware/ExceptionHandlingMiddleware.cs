using System.Text.Json;
using CineSeat.Application.Common.Exceptions;

namespace CineSeat.WebAPI.Middleware;

/// <summary>
/// Uygulamadaki TEK try/catch. Handler'lardan gelen exception'ları
/// uygun HTTP durum koduna ve tutarlı bir JSON gövdesine çevirir.
/// Bu sayede hiçbir controller ve handler'da hata yakalama kodu yok.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            // ValidationBehavior'dan geldi → 400
            await WriteAsync(context, StatusCodes.Status400BadRequest, new
            {
                title = "Doğrulama hatası",
                status = StatusCodes.Status400BadRequest,
                errors = ex.Errors
            });
        }
        catch (NotFoundException ex)
        {
            await WriteAsync(context, StatusCodes.Status404NotFound, new
            {
                title = "Kayıt bulunamadı",
                status = StatusCodes.Status404NotFound,
                detail = ex.Message
            });
        }
        catch (ConflictException ex)
        {
            await WriteAsync(context, StatusCodes.Status409Conflict, new
            {
                title = "Kaynak çakışması",
                status = StatusCodes.Status409Conflict,
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Beklenmeyen hata");

            await WriteAsync(context, StatusCodes.Status500InternalServerError, new
            {
                title = "Sunucu hatası",
                status = StatusCodes.Status500InternalServerError
            });
        }
    }

    private static async Task WriteAsync(HttpContext context, int statusCode, object body)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        await context.Response.WriteAsync(JsonSerializer.Serialize(body, JsonOptions));
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app) =>
        app.UseMiddleware<ExceptionHandlingMiddleware>();
}
