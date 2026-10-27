using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.SavedJobs.Queries;

public record GetMySavedJobsQuery : IRequest<Result<List<JobListDto>>>;

public class GetMySavedJobsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMySavedJobsQuery, Result<List<JobListDto>>>
{
    public async Task<Result<List<JobListDto>>> Handle(GetMySavedJobsQuery request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<List<JobListDto>>.Failure("User must be authenticated.");
        }

        var userId = currentUserService.UserId.Value;

        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return Result<List<JobListDto>>.Success([]);
        }

        var savedJobs = await context.SavedJobs
            .AsNoTracking()
            .Include(s => s.Job).ThenInclude(j => j.Company)
            .Include(s => s.Job).ThenInclude(j => j.Category)
            .Include(s => s.Job).ThenInclude(j => j.JobSkills).ThenInclude(js => js.Skill)
            .Where(s => s.JobSeekerProfileId == profile.Id && !s.Job.IsDeleted && s.Job.Status == JobStatus.Published)
            .OrderByDescending(s => s.SavedAtUtc)
            .Select(s => new JobListDto(
                s.Job.Id,
                s.Job.Title,
                s.Job.Location,
                s.Job.JobType,
                s.Job.ExperienceLevel,
                s.Job.SalaryMin,
                s.Job.SalaryMax,
                s.Job.SalaryCurrency,
                s.Job.IsRemote,
                s.Job.CreatedAtUtc,
                s.Job.DeadlineUtc,
                new CompanySummaryDto(s.Job.Company.Id, s.Job.Company.Name, s.Job.Company.LogoUrl, s.Job.Company.Location, s.Job.Company.IsVerified),
                new CategorySummaryDto(s.Job.Category.Id, s.Job.Category.Name, s.Job.Category.Slug, s.Job.Category.Icon),
                s.Job.JobSkills.Select(js => js.Skill.Name).ToList()
            ))
            .ToListAsync(cancellationToken);

        return Result<List<JobListDto>>.Success(savedJobs);
    }
}

public record GetMySavedJobIdsQuery : IRequest<Result<List<Guid>>>;

public class GetMySavedJobIdsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMySavedJobIdsQuery, Result<List<Guid>>>
{
    public async Task<Result<List<Guid>>> Handle(GetMySavedJobIdsQuery request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<List<Guid>>.Success([]);
        }

        var userId = currentUserService.UserId.Value;

        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return Result<List<Guid>>.Success([]);
        }

        var ids = await context.SavedJobs
            .AsNoTracking()
            .Where(s => s.JobSeekerProfileId == profile.Id)
            .Select(s => s.JobId)
            .ToListAsync(cancellationToken);

        return Result<List<Guid>>.Success(ids);
    }
}
