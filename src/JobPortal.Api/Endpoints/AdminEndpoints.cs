using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Admin.Commands;
using JobPortal.Application.Features.Admin.DTOs;
using JobPortal.Application.Features.Admin.Queries;
using JobPortal.Domain.Enums;

namespace JobPortal.Api.Endpoints;

public record UpdateJobStatusRequest(JobStatus Status);

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin")
            .WithTags("Admin & Platform Governance")
            .RequireAuthorization("RequireAdminRole");

        // 1. Platform Telemetry & Analytics
        group.MapGet("/analytics", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetPlatformAnalyticsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetPlatformAnalytics")
        .WithSummary("Retrieve platform-wide operational analytics, metrics, and activity stream")
        .Produces<PlatformAnalyticsDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        // 2. Job Moderation
        group.MapGet("/jobs", async (
            [FromQuery] JobStatus? status,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAdminJobsQuery(status), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetAdminJobs")
        .WithSummary("Retrieve all job requisitions across companies with status filtering")
        .Produces<List<AdminJobDto>>(StatusCodes.Status200OK);

        group.MapPut("/jobs/{id:guid}/status", async (
            Guid id,
            [FromBody] UpdateJobStatusRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateJobStatusByAdminCommand(id, request.Status), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateJobStatusByAdmin")
        .WithSummary("Update job publication status (Draft, Published, Archived)")
        .Produces<AdminJobDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/jobs/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteJobByAdminCommand(id), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(new { error = result.Error });
        })
        .WithName("DeleteJobByAdmin")
        .WithSummary("Soft delete a job requisition by administrator")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest);

        // 3. User Accounts & Moderation
        group.MapGet("/users", async (
            [FromQuery] UserRole? role,
            [FromQuery] string? search,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetAdminUsersQuery(role, search), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetAdminUsers")
        .WithSummary("Retrieve user accounts with role filtering, search, and lock status")
        .Produces<List<AdminUserDto>>(StatusCodes.Status200OK);

        group.MapPost("/users/{id:guid}/toggle-lock", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new ToggleUserLockoutCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ToggleUserLockout")
        .WithSummary("Toggle account lockout for a user")
        .Produces<AdminUserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/companies/{id:guid}/verify", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new ToggleCompanyVerificationCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { isVerified = result.Value }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ToggleCompanyVerification")
        .WithSummary("Administrator toggles company verification status")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // 4. Category Taxonomy Management
        group.MapPost("/categories", async (
            [FromBody] CreateCategoryRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new CreateCategoryCommand(request.Name, request.Slug, request.Description, request.Icon);
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Created($"/api/v1/categories/{result.Value.Id}", result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateCategory")
        .WithSummary("Create a new job classification category")
        .Produces<TopCategoryMetricDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/categories/{id:guid}", async (
            Guid id,
            [FromBody] UpdateCategoryRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateCategoryCommand(id, request.Name, request.Slug, request.Description, request.Icon);
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateCategory")
        .WithSummary("Update existing category taxonomy")
        .Produces<TopCategoryMetricDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/categories/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteCategoryCommand(id), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(new { error = result.Error });
        })
        .WithName("DeleteCategory")
        .WithSummary("Delete category taxonomy (only if no active jobs assigned)")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest);

        return app;
    }
}
