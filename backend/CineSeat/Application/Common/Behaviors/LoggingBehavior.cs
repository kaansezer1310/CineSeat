using System.Diagnostics;
using MediatR;

namespace CineSeat.Application.Common.Behaviors
{
    /// <summary>
    /// İkinci pipeline halkası: her Command/Query'nin adını ve süresini loglar.
    /// Tek satır kod yazmadan bütün isteklerin ölçülmesini sağlar —
    /// cross-cutting concern'ün pipeline'a taşınmasının en görünür örneği.
    /// </summary>
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var stopwatch = Stopwatch.StartNew();

            _logger.LogInformation("[CQRS] {RequestName} başladı", requestName);

            var response = await next();

            stopwatch.Stop();
            _logger.LogInformation(
                "[CQRS] {RequestName} bitti ({ElapsedMilliseconds} ms)",
                requestName, stopwatch.ElapsedMilliseconds);

            return response;
        }
    }
}
