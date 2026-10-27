using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Applications.Commands;
using JobPortal.Application.Features.Applications.DTOs;
using JobPortal.Application.Features.Applications.Queries;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Application.Features.SavedJobs.Commands;
using JobPortal.Application.Features.SavedJobs.Queries;

namespace JobPortal.Api.Endpoints;

public record ApplyRequest(string ResumeUrl, string? CoverLetter);

public static class ApplicationEndpoints
{
    public static IEndpointRouteBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        // 1. Applications Group
        var appGroup = app.MapGroup("/api/v1")
            .WithTags("Job Seeker Applications & Tracking");

        appGroup.MapPost("/jobs/{id:guid}/apply", async (
            Guid id,
            [FromBody] ApplyRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ApplyForJobCommand(id, request.ResumeUrl, request.CoverLetter);
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("ApplyForJob")
        .WithSummary("Submit an application for a specific job position")
        .Produces<ApplicationDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        appGroup.MapGet("/me/applications", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetMyApplicationsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("GetMyApplications")
        .WithSummary("Retrieve candidate's submitted job applications and timeline history")
        .Produces<List<ApplicationDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        appGroup.MapDelete("/me/applications/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new WithdrawApplicationCommand(id), ct);
            return result.IsSuccess ? Results.NoContent() : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("WithdrawApplication")
        .WithSummary("Withdraw a previously submitted application")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        // 2. Saved Jobs Group
        appGroup.MapPost("/jobs/{id:guid}/save", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new ToggleSaveJobCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { isSaved = result.Value }) : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("ToggleSaveJob")
        .WithSummary("Bookmark or un-bookmark a job posting")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        appGroup.MapGet("/me/saved-jobs", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetMySavedJobsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("GetMySavedJobs")
        .WithSummary("Retrieve all bookmarked jobs for the authenticated seeker")
        .Produces<List<JobListDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        appGroup.MapGet("/me/saved-job-ids", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetMySavedJobIdsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .RequireAuthorization()
        .WithName("GetMySavedJobIds")
        .WithSummary("Retrieve IDs of all saved jobs for quick client-side icon toggles")
        .Produces<List<Guid>>(StatusCodes.Status200OK);

        return app;
    }
}
