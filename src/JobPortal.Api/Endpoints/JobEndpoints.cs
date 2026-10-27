using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Common.Models;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Application.Features.Jobs.Queries;
using JobPortal.Domain.Enums;

namespace JobPortal.Api.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/jobs")
            .WithTags("Jobs");

        group.MapGet("/", async (
            [AsParameters] GetJobsQuery query,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(query, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetJobs")
        .WithSummary("Search and filter published jobs with pagination")
        .Produces<PaginatedList<JobListDto>>(StatusCodes.Status200OK);

        group.MapGet("/facets", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetJobFacetsQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetJobFacets")
        .WithSummary("Retrieve facet counts for skills, categories, experience levels, job types, and salary bounds")
        .Produces<JobFacetsDto>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetJobByIdQuery(id), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { message = result.Error });
        })
        .WithName("GetJobById")
        .WithSummary("Retrieve detailed job information by ID")
        .Produces<JobDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}
