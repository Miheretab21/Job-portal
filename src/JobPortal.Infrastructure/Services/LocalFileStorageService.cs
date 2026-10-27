using Microsoft.AspNetCore.Hosting;
using JobPortal.Application.Common.Interfaces;

namespace JobPortal.Infrastructure.Services;

public class LocalFileStorageService(IWebHostEnvironment env) : IFileStorageService
{
    private static readonly HashSet<string> AllowedExtensions =
        [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp"];

    public async Task<string> UploadFileAsync(Stream fileStream, string originalFileName, string folder, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
        {
            throw new InvalidOperationException($"File type '{ext}' is not permitted.");
        }

        var webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var targetDir = Path.Combine(webRoot, "uploads", folder);
        Directory.CreateDirectory(targetDir);

        var safeFileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(targetDir, safeFileName);

        await using var destinationStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(destinationStream, cancellationToken);

        return $"/uploads/{folder}/{safeFileName}";
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileUrl)) return Task.CompletedTask;

        var webRoot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var relative = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(webRoot, relative);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}
