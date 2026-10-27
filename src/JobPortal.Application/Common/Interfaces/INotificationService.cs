namespace JobPortal.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendNotificationToUserAsync(
        Guid userId,
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default);

    Task SendNotificationToCompanyAsync(
        Guid companyId,
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default);

    Task BroadcastNotificationAsync(
        string title,
        string message,
        string type,
        object? metadata = null,
        CancellationToken ct = default);
}
