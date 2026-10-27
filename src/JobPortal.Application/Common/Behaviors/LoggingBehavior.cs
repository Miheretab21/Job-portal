using System.Diagnostics;
using Microsoft.Extensions.Logging;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;

namespace JobPortal.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger,
    ICurrentUserService currentUserService)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = currentUserService.UserId?.ToString() ?? "Anonymous";

        logger.LogInformation("Handling {RequestName} for user {UserId}", requestName, userId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();
            stopwatch.Stop();

            if (stopwatch.ElapsedMilliseconds > 500)
            {
                logger.LogWarning("Long running request: {RequestName} ({ElapsedMilliseconds} ms) for user {UserId}",
                    requestName, stopwatch.ElapsedMilliseconds, userId);
            }
            else
            {
                logger.LogInformation("Handled {RequestName} in {ElapsedMilliseconds} ms",
                    requestName, stopwatch.ElapsedMilliseconds);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            logger.LogError(ex, "Request {RequestName} failed after {ElapsedMilliseconds} ms for user {UserId}",
                requestName, stopwatch.ElapsedMilliseconds, userId);
            throw;
        }
    }
}
