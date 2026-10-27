using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Employer.Commands;

public record CreateJobCommand(CreateJobRequest Request) : IRequest<Result<Guid>>;

public class CreateJobCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateJobCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateJobCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<Guid>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value, cancellationToken);

        if (company is null)
        {
            return Result<Guid>.Failure("Employer company profile not found. Please complete company setup first.");
        }

        var req = command.Request;

        // Optionally update company profile info if supplied during job posting
        if (!string.IsNullOrWhiteSpace(req.CompanyDescription))
        {
            company.Description = req.CompanyDescription.Trim();
        }
        if (!string.IsNullOrWhiteSpace(req.CompanyWebsite))
        {
            company.Website = req.CompanyWebsite.Trim();
        }
        if (!string.IsNullOrWhiteSpace(req.CompanyIndustry))
        {
            company.Industry = req.CompanyIndustry.Trim();
        }
        if (!string.IsNullOrWhiteSpace(req.CompanySize))
        {
            company.CompanySize = req.CompanySize.Trim();
        }

        if (string.IsNullOrWhiteSpace(req.Title))
        {
            return Result<Guid>.Failure("Job title is required.");
        }

        if (string.IsNullOrWhiteSpace(req.Description))
        {
            return Result<Guid>.Failure("Job description is required.");
        }

        var categoryExists = await context.JobCategories.AnyAsync(c => c.Id == req.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            return Result<Guid>.Failure("Invalid job category selected.");
        }

        var job = new Job
        {
            CompanyId = company.Id,
            CategoryId = req.CategoryId,
            Title = req.Title.Trim(),
            Description = req.Description.Trim(),
            Requirements = req.Requirements?.Trim(),
            Benefits = req.Benefits?.Trim(),
            Location = string.IsNullOrWhiteSpace(req.Location) ? "Remote" : req.Location.Trim(),
            JobType = (JobType)req.JobType,
            ExperienceLevel = (ExperienceLevel)req.ExperienceLevel,
            SalaryMin = req.SalaryMin,
            SalaryMax = req.SalaryMax,
            SalaryCurrency = string.IsNullOrWhiteSpace(req.SalaryCurrency) ? "USD" : req.SalaryCurrency.Trim().ToUpperInvariant(),
            IsRemote = req.IsRemote,
            Status = JobStatus.Published,
            ViewsCount = 0,
            NumberOfPositions = req.NumberOfPositions > 0 ? req.NumberOfPositions : 1,
            EducationLevel = req.EducationLevel,
            YearsOfExperience = req.YearsOfExperience,
            LanguageRequirements = req.LanguageRequirements,
            IsSalaryNegotiable = req.IsSalaryNegotiable,
            AmharicTitle = req.AmharicTitle,
            AmharicDescription = req.AmharicDescription,
            City = req.City,
            DeadlineUtc = req.DeadlineUtc ?? DateTime.UtcNow.AddDays(30)
        };

        context.Jobs.Add(job);

        // Process skills
        if (req.SkillNames is not null && req.SkillNames.Count > 0)
        {
            var distinctSkills = req.SkillNames
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var skillName in distinctSkills)
            {
                var skill = await context.Skills
                    .FirstOrDefaultAsync(s => s.Name.ToLower() == skillName.ToLower(), cancellationToken);

                if (skill is null)
                {
                    skill = new Skill
                    {
                        Name = skillName
                    };
                    context.Skills.Add(skill);
                }

                job.JobSkills.Add(new JobSkill
                {
                    Job = job,
                    Skill = skill
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(job.Id);
    }
}
