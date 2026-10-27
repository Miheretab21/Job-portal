using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.Commands;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Application.Features.Employer.Queries;

namespace JobPortal.Api.Endpoints;

public record UpdateStatusRequest(int Status);

public static class EmployerEndpoints
{
    public static IEndpointRouteBuilder MapEmployerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/employer")
            .WithTags("Employer Portal & Applicant Pipeline")
            .RequireAuthorization();

        // 1. Dashboard summary
        group.MapGet("/summary", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetEmployerDashboardSummaryQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetEmployerDashboardSummary")
        .WithSummary("Retrieve employer dashboard key metrics")
        .Produces<EmployerDashboardSummaryDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // 2. Employer Jobs
        group.MapGet("/jobs", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetEmployerJobsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetEmployerJobs")
        .WithSummary("Retrieve all job listings posted by the employer's company")
        .Produces<List<EmployerJobItemDto>>(StatusCodes.Status200OK);

        group.MapPost("/jobs", async ([FromBody] CreateJobRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new CreateJobCommand(request), ct);
            return result.IsSuccess ? Results.Ok(new { jobId = result.Value }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateJobPosting")
        .WithSummary("Publish a new job posting for the employer's company")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/jobs/{id:guid}", async (Guid id, [FromBody] UpdateJobRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateJobCommand(id, request), ct);
            return result.IsSuccess ? Results.Ok(new { jobId = result.Value }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateJobPosting")
        .WithSummary("Update an existing job posting for the employer's company")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/jobs/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteEmployerJobCommand(id), ct);
            return result.IsSuccess ? Results.Ok(new { success = true }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("DeleteEmployerJobPosting")
        .WithSummary("Soft delete a job posting belonging to the employer's company")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/jobs/{id:guid}/status", async (Guid id, [FromBody] UpdateStatusRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateJobStatusCommand(id, request.Status), ct);
            return result.IsSuccess ? Results.Ok(new { success = true }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateJobStatus")
        .WithSummary("Update a job listing status (Published, Draft, Closed)")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // 3. Applicants pipeline
        group.MapGet("/applicants", async ([FromQuery] Guid? jobId, [FromQuery] bool? sortByScore, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetEmployerApplicantsQuery(jobId, sortByScore ?? false), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetEmployerApplicants")
        .WithSummary("Retrieve candidates and applications across all or specific company jobs with optional AI score sorting")
        .Produces<List<EmployerApplicantDto>>(StatusCodes.Status200OK);

        group.MapPut("/applications/{id:guid}/stage", async (Guid id, [FromBody] UpdateApplicantStageRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateApplicantStageCommand(id, request.NewStatus, request.Notes), ct);
            return result.IsSuccess ? Results.Ok(new { success = true }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateApplicantStage")
        .WithSummary("Advance applicant pipeline stage and record feedback notes")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // 4. AI-Powered Resume Scoring Endpoints
        group.MapPost("/applications/{id:guid}/score", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new ScoreApplicationCommand(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ScoreApplicantResume")
        .WithSummary("Run AI compatibility scoring engine on a candidate's application against the job requirements")
        .Produces<JobPortal.Application.Common.Interfaces.AiScoreResult>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/jobs/{jobId:guid}/score-applicants", async (Guid jobId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new BatchScoreJobApplicantsCommand(jobId), ct);
            return result.IsSuccess ? Results.Ok(new { scoredCount = result.Value }) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("BatchScoreJobApplicants")
        .WithSummary("Run bulk AI scoring across all applicants for a specific requisition")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        // 5. Company Profile & Verification
        group.MapGet("/company", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetEmployerCompanyQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetEmployerCompany")
        .WithSummary("Get employer's current organization profile details")
        .Produces<EmployerCompanyProfileDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/company", async ([FromBody] UpdateCompanyProfileRequest request, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new UpdateEmployerCompanyCommand(request), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.Error });
        })
        .WithName("UpdateEmployerCompany")
        .WithSummary("Update employer company profile details (overview, website, industry, size)")
        .Produces<EmployerCompanyProfileDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        return app;
    }
}
