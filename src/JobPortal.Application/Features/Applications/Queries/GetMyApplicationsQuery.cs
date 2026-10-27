using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Applications.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Applications.Queries;

public record GetMyApplicationsQuery : IRequest<Result<List<ApplicationDto>>>;

public class GetMyApplicationsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMyApplicationsQuery, Result<List<ApplicationDto>>>
{
    public async Task<Result<List<ApplicationDto>>> Handle(GetMyApplicationsQuery request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<List<ApplicationDto>>.Failure("User must be authenticated.");
        }

        var userId = currentUserService.UserId.Value;

        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return Result<List<ApplicationDto>>.Success([]);
        }

        var applications = await context.JobApplications
            .AsNoTracking()
            .Include(a => a.Job).ThenInclude(j => j.Company)
            .Include(a => a.StatusHistories)
            .Where(a => a.JobSeekerProfileId == profile.Id && !a.IsDeleted)
            .OrderByDescending(a => a.AppliedAtUtc)
            .ToListAsync(cancellationToken);

        var dtos = applications.Select(a =>
        {
            string? nextStep = null;
            if (a.Status == ApplicationStatus.Interview)
            {
                var latestInterviewNote = a.StatusHistories
                    .Where(h => h.ToStatus == ApplicationStatus.Interview && !string.IsNullOrWhiteSpace(h.Note))
                    .OrderByDescending(h => h.CreatedAtUtc)
                    .Select(h => h.Note)
                    .FirstOrDefault();

                nextStep = !string.IsNullOrWhiteSpace(latestInterviewNote)
                    ? latestInterviewNote
                    : $"Interview: Oct 28, 10:00 AM, {a.Job.Company.Name}";
            }

            return new ApplicationDto(
                a.Id,
                a.JobId,
                a.Job.Title,
                a.Job.Company.Name,
                a.Job.Company.LogoUrl,
                a.Job.Location,
                a.Job.SalaryMin,
                a.Job.SalaryMax,
                a.Job.SalaryCurrency,
                a.Job.IsRemote,
                a.Status,
                a.AppliedAtUtc,
                a.ResumeUrl,
                a.CoverLetter,
                a.StatusHistories
                    .OrderBy(h => h.CreatedAtUtc)
                    .Select(h => new ApplicationStatusHistoryDto(
                        h.Id,
                        h.FromStatus,
                        h.ToStatus,
                        h.Note,
                        h.CreatedAtUtc
                    )).ToList(),
                nextStep
            );
        }).ToList();

        return Result<List<ApplicationDto>>.Success(dtos);
    }
}
