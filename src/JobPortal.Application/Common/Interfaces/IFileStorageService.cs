namespace JobPortal.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string originalFileName, string folder, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);
}

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
