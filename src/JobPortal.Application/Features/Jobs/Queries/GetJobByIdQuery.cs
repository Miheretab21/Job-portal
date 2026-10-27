using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Exceptions;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Features.Jobs.Queries;

public record GetJobByIdQuery(Guid Id) : IRequest<Result<JobDto>>;

public class GetJobByIdQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetJobByIdQuery, Result<JobDto>>
{
    public async Task<Result<JobDto>> Handle(GetJobByIdQuery request, CancellationToken cancellationToken)
    {
        var job = await context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.JobSkills).ThenInclude(js => js.Skill)
            .FirstOrDefaultAsync(j => j.Id == request.Id && !j.IsDeleted, cancellationToken);

        if (job == null)
        {
            return Result<JobDto>.Failure($"Job with id '{request.Id}' was not found.");
        }

        // Increment view count
        job.ViewsCount++;
        await context.SaveChangesAsync(cancellationToken);

        var dto = new JobDto(
            job.Id,
            job.Title,
            job.Description,
            job.Requirements,
            job.Benefits,
            job.Location,
            job.JobType,
            job.ExperienceLevel,
            job.SalaryMin,
            job.SalaryMax,
            job.SalaryCurrency,
            job.IsRemote,
            job.DeadlineUtc,
            job.Status,
            job.ViewsCount,
            job.CreatedAtUtc,
            new CompanySummaryDto(
                job.Company.Id,
                job.Company.Name,
                job.Company.LogoUrl,
                job.Company.Location,
                job.Company.IsVerified,
                job.Company.Description,
                job.Company.Website,
                job.Company.Industry,
                job.Company.CompanySize),
            new CategorySummaryDto(job.Category.Id, job.Category.Name, job.Category.Slug, job.Category.Icon),
            job.JobSkills.Select(s => s.Skill.Name).ToList(),
            job.NumberOfPositions,
            job.EducationLevel,
            job.YearsOfExperience,
            job.LanguageRequirements,
            job.IsSalaryNegotiable,
            job.AmharicTitle,
            job.AmharicDescription,
            job.City
        );

        return Result<JobDto>.Success(dto);
    }
}
