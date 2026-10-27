using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Employer.Commands;

public record UpdateJobCommand(Guid JobId, UpdateJobRequest Request) : IRequest<Result<Guid>>;

public class UpdateJobCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateJobCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(UpdateJobCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<Guid>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value && !c.IsDeleted, cancellationToken);

        if (company is null)
        {
            return Result<Guid>.Failure("Employer company profile not found.");
        }

        var job = await context.Jobs
            .Include(j => j.JobSkills)
            .FirstOrDefaultAsync(j => j.Id == command.JobId && j.CompanyId == company.Id && !j.IsDeleted, cancellationToken);

        if (job is null)
        {
            return Result<Guid>.Failure("Job requisition not found or does not belong to your company.");
        }

        var req = command.Request;

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

        // Update company metadata if provided
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

        // Update Job properties
        job.Title = req.Title.Trim();
        job.CategoryId = req.CategoryId;
        job.Description = req.Description.Trim();
        job.Requirements = req.Requirements?.Trim();
        job.Benefits = req.Benefits?.Trim();
        job.Location = string.IsNullOrWhiteSpace(req.Location) ? "Remote" : req.Location.Trim();
        job.JobType = (JobType)req.JobType;
        job.ExperienceLevel = (ExperienceLevel)req.ExperienceLevel;
        job.SalaryMin = req.SalaryMin;
        job.SalaryMax = req.SalaryMax;
        job.SalaryCurrency = string.IsNullOrWhiteSpace(req.SalaryCurrency) ? "ETB" : req.SalaryCurrency.Trim().ToUpperInvariant();
        job.IsRemote = req.IsRemote;
        job.NumberOfPositions = req.NumberOfPositions > 0 ? req.NumberOfPositions : 1;
        job.EducationLevel = req.EducationLevel;
        job.YearsOfExperience = req.YearsOfExperience;
        job.LanguageRequirements = req.LanguageRequirements;
        job.IsSalaryNegotiable = req.IsSalaryNegotiable;
        job.AmharicTitle = req.AmharicTitle;
        job.AmharicDescription = req.AmharicDescription;
        job.City = req.City;
        if (req.DeadlineUtc.HasValue)
        {
            job.DeadlineUtc = req.DeadlineUtc.Value;
        }

        // Update skills: remove existing and re-add
        job.JobSkills.Clear();

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
                    skill = new Skill { Name = skillName };
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
