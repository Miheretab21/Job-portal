using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Jobs.Queries;

public record GetJobFacetsQuery : IRequest<Result<JobFacetsDto>>;

public class GetJobFacetsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetJobFacetsQuery, Result<JobFacetsDto>>
{
    public async Task<Result<JobFacetsDto>> Handle(GetJobFacetsQuery request, CancellationToken cancellationToken)
    {
        var baseJobs = context.Jobs
            .AsNoTracking()
            .Where(j => !j.IsDeleted && j.Status == JobStatus.Published);

        var totalJobs = await baseJobs.CountAsync(cancellationToken);
        var remoteJobsCount = await baseJobs.CountAsync(j => j.IsRemote, cancellationToken);

        // 1. Skill Facets (Top skills by count, evaluated in memory for guaranteed EF Core translation safety)
        var skillNamesRaw = await context.JobSkills
            .AsNoTracking()
            .Where(js => !js.Job.IsDeleted && js.Job.Status == JobStatus.Published)
            .Select(js => js.Skill.Name)
            .ToListAsync(cancellationToken);

        var skillCounts = skillNamesRaw
            .GroupBy(name => name)
            .Select(g => new FacetItemDto(
                g.Key,
                g.Key,
                g.Count(),
                null
            ))
            .OrderByDescending(f => f.Count)
            .ThenBy(f => f.Label)
            .Take(25)
            .ToList();

        // 2. Category Facets
        var categoryRaw = await baseJobs
            .Select(j => new { j.Category.Id, j.Category.Name, j.Category.Slug })
            .ToListAsync(cancellationToken);

        var categoryCounts = categoryRaw
            .GroupBy(c => new { c.Id, c.Name, c.Slug })
            .Select(g => new FacetItemDto(
                g.Key.Slug,
                g.Key.Name,
                g.Count(),
                g.Key.Id.ToString()
            ))
            .OrderByDescending(f => f.Count)
            .ThenBy(f => f.Label)
            .ToList();

        // 3. Experience Levels
        var expRaw = await baseJobs
            .Select(j => j.ExperienceLevel)
            .ToListAsync(cancellationToken);

        var expMap = new Dictionary<ExperienceLevel, string>
        {
            { ExperienceLevel.EntryLevel, "Entry Level" },
            { ExperienceLevel.MidLevel, "Mid Level" },
            { ExperienceLevel.SeniorLevel, "Senior Level" },
            { ExperienceLevel.Lead, "Lead / Staff" },
            { ExperienceLevel.Executive, "Executive / Director" }
        };

        var experienceFacets = Enum.GetValues<ExperienceLevel>()
            .Select(level => new FacetItemDto(
                ((int)level).ToString(),
                expMap.TryGetValue(level, out var label) ? label : level.ToString(),
                expRaw.Count(e => e == level),
                null
            ))
            .ToList();

        // 4. Job Types
        var typeRaw = await baseJobs
            .Select(j => j.JobType)
            .ToListAsync(cancellationToken);

        var typeMap = new Dictionary<JobType, string>
        {
            { JobType.FullTime, "Full-time" },
            { JobType.PartTime, "Part-time" },
            { JobType.Contract, "Contract" },
            { JobType.Internship, "Internship" }
        };

        var jobTypeFacets = Enum.GetValues<JobType>()
            .Where(type => type != JobType.Remote)
            .Select(type => new FacetItemDto(
                ((int)type).ToString(),
                typeMap.TryGetValue(type, out var label) ? label : type.ToString(),
                typeRaw.Count(t => t == type),
                null
            ))
            .ToList();

        // 5. Salary Range
        var salaries = await baseJobs
            .Where(j => j.SalaryMin.HasValue || j.SalaryMax.HasValue)
            .Select(j => new { Min = j.SalaryMin, Max = j.SalaryMax })
            .ToListAsync(cancellationToken);

        var minSalary = salaries.Count > 0 ? (salaries.Where(s => s.Min.HasValue).Min(s => s.Min) ?? 40000m) : 40000m;
        var maxSalary = salaries.Count > 0 ? (salaries.Where(s => s.Max.HasValue).Max(s => s.Max) ?? 250000m) : 250000m;

        var facetsDto = new JobFacetsDto(
            skillCounts,
            categoryCounts,
            experienceFacets,
            jobTypeFacets,
            minSalary,
            maxSalary,
            totalJobs,
            remoteJobsCount
        );

        return Result<JobFacetsDto>.Success(facetsDto);
    }
}
