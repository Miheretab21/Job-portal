using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Common.Models;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Jobs.Queries;

public record GetJobsQuery : IRequest<Result<PaginatedList<JobListDto>>>
{
    public string? Search { get; init; }
    public Guid? CategoryId { get; init; }
    public string? CategorySlug { get; init; }
    public JobType? JobType { get; init; }
    public string? JobTypes { get; init; } // Comma-separated: e.g. "1,3"
    public ExperienceLevel? ExperienceLevel { get; init; }
    public string? ExperienceLevels { get; init; } // Comma-separated: e.g. "1,2,3"
    public bool? IsRemote { get; init; }
    public decimal? MinSalary { get; init; }
    public decimal? MaxSalary { get; init; }
    public string? SalaryCurrency { get; init; }
    public string? Skill { get; init; }
    public string? Skills { get; init; } // Comma-separated: e.g. "Kubernetes,.NET 10"
    public string? Location { get; init; }
    public string? EducationLevel { get; init; }
    public string? City { get; init; }
    public bool? IsNegotiable { get; init; }
    public string? SortBy { get; init; } // "recent", "salary_desc", "salary_asc", "views", "deadline", "title"
    public int? PageNumber { get; init; } = 1;
    public int? PageSize { get; init; } = 10;
}

public class GetJobsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetJobsQuery, Result<PaginatedList<JobListDto>>>
{
    public async Task<Result<PaginatedList<JobListDto>>> Handle(GetJobsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Jobs
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.JobSkills).ThenInclude(js => js.Skill)
            .Where(j => !j.IsDeleted && j.Status == JobStatus.Published);

        // 1. Full-text search across Title, AmharicTitle, Description, Company Name, Requirements, and Skills
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(j =>
                j.Title.ToLower().Contains(search) ||
                (j.AmharicTitle != null && j.AmharicTitle.ToLower().Contains(search)) ||
                j.Description.ToLower().Contains(search) ||
                (j.Requirements != null && j.Requirements.ToLower().Contains(search)) ||
                j.Company.Name.ToLower().Contains(search) ||
                (j.City != null && j.City.ToLower().Contains(search)) ||
                j.JobSkills.Any(js => js.Skill.Name.ToLower().Contains(search)));
        }

        // 2. Category filtering
        if (request.CategoryId.HasValue)
        {
            query = query.Where(j => j.CategoryId == request.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.CategorySlug))
        {
            query = query.Where(j => j.Category.Slug == request.CategorySlug.Trim().ToLower());
        }

        // 3. Employment Type filtering (single or multi)
        var typeFilterList = new List<JobType>();
        if (!string.IsNullOrWhiteSpace(request.JobTypes))
        {
            foreach (var part in request.JobTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (int.TryParse(part, out var intVal) && Enum.IsDefined(typeof(JobType), intVal))
                {
                    typeFilterList.Add((JobType)intVal);
                }
                else if (Enum.TryParse<JobType>(part, true, out var enumVal))
                {
                    typeFilterList.Add(enumVal);
                }
            }
        }
        if (request.JobType.HasValue && !typeFilterList.Contains(request.JobType.Value))
        {
            typeFilterList.Add(request.JobType.Value);
        }
        if (typeFilterList.Count > 0)
        {
            query = query.Where(j => typeFilterList.Contains(j.JobType));
        }

        // 4. Experience Level filtering (single or multi)
        var expFilterList = new List<ExperienceLevel>();
        if (!string.IsNullOrWhiteSpace(request.ExperienceLevels))
        {
            foreach (var part in request.ExperienceLevels.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (int.TryParse(part, out var intVal) && Enum.IsDefined(typeof(ExperienceLevel), intVal))
                {
                    expFilterList.Add((ExperienceLevel)intVal);
                }
                else if (Enum.TryParse<ExperienceLevel>(part, true, out var enumVal))
                {
                    expFilterList.Add(enumVal);
                }
            }
        }
        if (request.ExperienceLevel.HasValue && !expFilterList.Contains(request.ExperienceLevel.Value))
        {
            expFilterList.Add(request.ExperienceLevel.Value);
        }
        if (expFilterList.Count > 0)
        {
            query = query.Where(j => expFilterList.Contains(j.ExperienceLevel));
        }

        // 5. Remote-only filtering
        if (request.IsRemote.HasValue)
        {
            query = query.Where(j => j.IsRemote == request.IsRemote.Value);
        }

        // 6. Salary range filtering (supports min, max, negotiable)
        if (request.IsNegotiable == true)
        {
            query = query.Where(j => j.IsSalaryNegotiable);
        }
        else
        {
            if (request.MinSalary.HasValue)
            {
                query = query.Where(j => (j.SalaryMax.HasValue && j.SalaryMax >= request.MinSalary.Value) ||
                                         (j.SalaryMin.HasValue && j.SalaryMin >= request.MinSalary.Value));
            }

            if (request.MaxSalary.HasValue)
            {
                query = query.Where(j => (j.SalaryMin.HasValue && j.SalaryMin <= request.MaxSalary.Value) ||
                                         (j.SalaryMax.HasValue && j.SalaryMax <= request.MaxSalary.Value));
            }
        }

        if (!string.IsNullOrWhiteSpace(request.SalaryCurrency))
        {
            var cur = request.SalaryCurrency.Trim().ToUpper();
            query = query.Where(j => j.SalaryCurrency.ToUpper() == cur);
        }

        // 7. Multi-Skill Tag filtering
        var skillFilterList = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.Skills))
        {
            skillFilterList.AddRange(request.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
        }
        if (!string.IsNullOrWhiteSpace(request.Skill) && !skillFilterList.Contains(request.Skill, StringComparer.OrdinalIgnoreCase))
        {
            skillFilterList.Add(request.Skill.Trim());
        }
        if (skillFilterList.Count > 0)
        {
            var skillLower = skillFilterList.Select(s => s.ToLower()).ToList();
            query = query.Where(j => j.JobSkills.Any(js => skillLower.Contains(js.Skill.Name.ToLower())));
        }

        // 8. Location & City filtering
        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var loc = request.Location.Trim().ToLower();
            query = query.Where(j => j.Location.ToLower().Contains(loc) || (j.City != null && j.City.ToLower().Contains(loc)));
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            var city = request.City.Trim().ToLower();
            query = query.Where(j => j.City != null && j.City.ToLower().Contains(city));
        }

        // 8b. Education Level filtering
        if (!string.IsNullOrWhiteSpace(request.EducationLevel))
        {
            var edu = request.EducationLevel.Trim().ToLower();
            query = query.Where(j => j.EducationLevel != null && j.EducationLevel.ToLower().Contains(edu));
        }

        // 9. Sorting
        query = request.SortBy?.ToLower() switch
        {
            "salary" or "salary_desc" => query.OrderByDescending(j => j.SalaryMax ?? j.SalaryMin ?? 0),
            "salary_asc" => query.OrderBy(j => j.SalaryMin ?? j.SalaryMax ?? decimal.MaxValue),
            "views" or "popular" => query.OrderByDescending(j => j.ViewsCount),
            "deadline" => query.OrderBy(j => j.DeadlineUtc ?? DateTime.MaxValue),
            "title" => query.OrderBy(j => j.Title),
            _ => query.OrderByDescending(j => j.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var pageNumber = request.PageNumber is > 0 ? request.PageNumber.Value : 1;
        var pageSize = request.PageSize is > 0 and <= 50 ? request.PageSize.Value : 10;

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobListDto(
                j.Id,
                j.Title,
                j.Location,
                j.JobType,
                j.ExperienceLevel,
                j.SalaryMin,
                j.SalaryMax,
                j.SalaryCurrency,
                j.IsRemote,
                j.CreatedAtUtc,
                j.DeadlineUtc,
                new CompanySummaryDto(j.Company.Id, j.Company.Name, j.Company.LogoUrl, j.Company.Location, j.Company.IsVerified),
                new CategorySummaryDto(j.Category.Id, j.Category.Name, j.Category.Slug, j.Category.Icon),
                j.JobSkills.Select(s => s.Skill.Name).ToList(),
                j.NumberOfPositions,
                j.EducationLevel,
                j.YearsOfExperience,
                j.LanguageRequirements,
                j.IsSalaryNegotiable,
                j.AmharicTitle,
                j.AmharicDescription,
                j.City
            ))
            .ToListAsync(cancellationToken);

        var result = new PaginatedList<JobListDto>(items, totalCount, pageNumber, pageSize);
        return Result<PaginatedList<JobListDto>>.Success(result);
    }
}
