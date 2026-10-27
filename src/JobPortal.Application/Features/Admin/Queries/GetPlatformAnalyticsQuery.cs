using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Admin.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Admin.Queries;

public record GetPlatformAnalyticsQuery : IRequest<Result<PlatformAnalyticsDto>>;

public class GetPlatformAnalyticsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlatformAnalyticsQuery, Result<PlatformAnalyticsDto>>
{
    public async Task<Result<PlatformAnalyticsDto>> Handle(GetPlatformAnalyticsQuery request, CancellationToken cancellationToken)
    {
        // 1. User metrics
        var users = await context.Users
            .Where(u => !u.IsDeleted)
            .Select(u => new { u.Role, u.CreatedAtUtc, u.FullName, u.Email })
            .ToListAsync(cancellationToken);

        var totalUsers = users.Count;
        var seekerCount = users.Count(u => u.Role == UserRole.JobSeeker);
        var employerCount = users.Count(u => u.Role == UserRole.Employer);
        var adminCount = users.Count(u => u.Role == UserRole.Admin);

        // 2. Job metrics
        var jobs = await context.Jobs
            .Where(j => !j.IsDeleted)
            .Select(j => new { j.Status, j.Title, j.CreatedAtUtc, j.CompanyId })
            .ToListAsync(cancellationToken);

        var totalJobs = jobs.Count;
        var publishedJobs = jobs.Count(j => j.Status == JobStatus.Published);
        var draftJobs = jobs.Count(j => j.Status == JobStatus.Draft);
        var archivedJobs = jobs.Count(j => j.Status == JobStatus.Archived);

        // 3. Application metrics
        var apps = await context.JobApplications
            .Where(a => !a.IsDeleted)
            .Select(a => new { a.Status, a.AppliedAtUtc })
            .ToListAsync(cancellationToken);

        var totalApps = apps.Count;
        var hiredApps = apps.Count(a => a.Status == ApplicationStatus.Hired);
        var inReviewApps = apps.Count(a => a.Status == ApplicationStatus.InReview || a.Status == ApplicationStatus.Interview || a.Status == ApplicationStatus.Shortlisted);
        var rejectedApps = apps.Count(a => a.Status == ApplicationStatus.Rejected);

        // 4. Counts
        var totalCategories = await context.JobCategories.CountAsync(cancellationToken);
        var totalCompanies = await context.Companies.CountAsync(c => !c.IsDeleted, cancellationToken);

        // 5. Top Categories with active jobs
        var categoriesList = await context.JobCategories
            .Select(c => new TopCategoryMetricDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Icon,
                c.Jobs.Count(j => !j.IsDeleted && j.Status == JobStatus.Published)
            ))
            .ToListAsync(cancellationToken);

        var topCategories = categoriesList
            .OrderByDescending(c => c.ActiveJobsCount)
            .Take(6)
            .ToList();

        // 6. Recent Platform Activities
        var activities = new List<PlatformActivityDto>();

        // Recent applications
        var recentApplications = await context.JobApplications
            .Where(a => !a.IsDeleted)
            .Include(a => a.Job)
            .Include(a => a.SeekerProfile).ThenInclude(p => p.User)
            .OrderByDescending(a => a.AppliedAtUtc)
            .Take(4)
            .ToListAsync(cancellationToken);

        foreach (var a in recentApplications)
        {
            activities.Add(new PlatformActivityDto(
                "application",
                $"{a.SeekerProfile.User.FirstName} applied for {a.Job.Title}",
                $"Status: {a.Status}",
                a.AppliedAtUtc
            ));
        }

        // Recent jobs
        var recentJobs = await context.Jobs
            .Where(j => !j.IsDeleted)
            .Include(j => j.Company)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Take(4)
            .ToListAsync(cancellationToken);

        foreach (var j in recentJobs)
        {
            activities.Add(new PlatformActivityDto(
                "job",
                $"Requisition: {j.Title}",
                $"Company: {j.Company.Name} ({j.Status})",
                j.CreatedAtUtc
            ));
        }

        // Recent users
        var recentUsers = users
            .OrderByDescending(u => u.CreatedAtUtc)
            .Take(4);

        foreach (var u in recentUsers)
        {
            activities.Add(new PlatformActivityDto(
                "user",
                $"User registered: {u.FullName}",
                $"Role: {u.Role} ({u.Email})",
                u.CreatedAtUtc
            ));
        }

        var sortedActivities = activities
            .OrderByDescending(a => a.TimestampUtc)
            .Take(10)
            .ToList();

        var dto = new PlatformAnalyticsDto(
            totalUsers,
            seekerCount,
            employerCount,
            adminCount,
            totalJobs,
            publishedJobs,
            draftJobs,
            archivedJobs,
            totalApps,
            hiredApps,
            inReviewApps,
            rejectedApps,
            totalCategories,
            totalCompanies,
            topCategories,
            sortedActivities
        );

        return Result<PlatformAnalyticsDto>.Success(dto);
    }
}
