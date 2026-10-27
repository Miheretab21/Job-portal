using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Interfaces;

namespace JobPortal.Api.Endpoints;

public record FileUploadResponse(
    string Url,
    string RelativePath,
    string FileName,
    long Size,
    string ContentType
);

public static class FileEndpoints
{
    private static readonly HashSet<string> AllowedResumeExtensions = [".pdf", ".doc", ".docx"];
    private static readonly HashSet<string> AllowedImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public static IEndpointRouteBuilder MapFileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/files")
            .WithTags("Files & Document Storage");

        group.MapPost("/upload", async (
            IFormFile? file,
            [FromQuery] string? folder,
            IFileStorageService storageService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            if (file is null || file.Length == 0)
            {
                return Results.BadRequest(new { error = "No file was uploaded." });
            }

            if (file.Length > MaxFileSize)
            {
                return Results.BadRequest(new { error = "File size exceeds maximum permitted limit of 10 MB." });
            }

            var targetFolder = string.IsNullOrWhiteSpace(folder) ? "resumes" : folder.Trim().ToLowerInvariant();
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (targetFolder == "resumes")
            {
                if (!AllowedResumeExtensions.Contains(ext))
                {
                    return Results.BadRequest(new { error = $"Invalid document format '{ext}'. Only PDF, DOC, and DOCX files are permitted for resumes." });
                }
            }
            else
            {
                if (!AllowedResumeExtensions.Contains(ext) && !AllowedImageExtensions.Contains(ext))
                {
                    return Results.BadRequest(new { error = $"File type '{ext}' is not permitted." });
                }
            }

            await using var stream = file.OpenReadStream();
            var relativePath = await storageService.UploadFileAsync(stream, file.FileName, targetFolder, ct);

            var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
            var absoluteUrl = $"{baseUrl}{relativePath}";

            var response = new FileUploadResponse(
                absoluteUrl,
                relativePath,
                file.FileName,
                file.Length,
                file.ContentType
            );

            return Results.Ok(response);
        })
        .DisableAntiforgery()
        .WithName("UploadFile")
        .WithSummary("Upload a document or image file (PDF, DOCX, PNG)")
        .Produces<FileUploadResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/", async (
            [FromQuery] string fileUrl,
            IFileStorageService storageService,
            CancellationToken ct) =>
        {
            await storageService.DeleteFileAsync(fileUrl, ct);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .WithName("DeleteFile")
        .WithSummary("Delete a previously uploaded file")
        .Produces(StatusCodes.Status204NoContent);

        return app;
    }
}
