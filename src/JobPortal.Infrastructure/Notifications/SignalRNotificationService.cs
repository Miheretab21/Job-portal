using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using JobPortal.Application.Common.Interfaces;

namespace JobPortal.Infrastructure.Notifications;

public record NotificationPayload(
    Guid Id,
    string Title,
    string Message,
    string Type,
    DateTime CreatedAtUtc,
    object? Metadata
);

public class SignalRNotificationService(IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task SendNotificationToUserAsync(
        Guid userId,
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default)
    {
        var payload = new NotificationPayload(
            Guid.CreateVersion7(),
            title,
            message,
            type,
            DateTime.UtcNow,
            metadata
        );

        await hubContext.Clients.Group($"user-{userId}")
            .SendAsync("ReceiveNotification", payload, ct);
    }

    public async Task SendNotificationToCompanyAsync(
        Guid companyId,
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default)
    {
        var payload = new NotificationPayload(
            Guid.CreateVersion7(),
            title,
            message,
            type,
            DateTime.UtcNow,
            metadata
        );

        await hubContext.Clients.Group($"company-{companyId}")
            .SendAsync("ReceiveNotification", payload, ct);
    }

    public async Task BroadcastNotificationAsync(
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default)
    {
        var payload = new NotificationPayload(
            Guid.CreateVersion7(),
            title,
            message,
            type,
            DateTime.UtcNow,
            metadata
        );

        await hubContext.Clients.All
            .SendAsync("ReceiveNotification", payload, ct);
    }
}
