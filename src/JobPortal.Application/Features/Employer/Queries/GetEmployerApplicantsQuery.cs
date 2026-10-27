using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Applications.DTOs;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Queries;

public record GetEmployerApplicantsQuery(Guid? JobId = null, bool SortByScore = false) : IRequest<Result<List<EmployerApplicantDto>>>;

public class GetEmployerApplicantsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<GetEmployerApplicantsQuery, Result<List<EmployerApplicantDto>>>
{
    public async Task<Result<List<EmployerApplicantDto>>> Handle(GetEmployerApplicantsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<List<EmployerApplicantDto>>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value, cancellationToken);

        if (company is null)
        {
            return Result<List<EmployerApplicantDto>>.Failure("Employer profile or company not found.");
        }

        var query = context.JobApplications
            .AsNoTracking()
            .Where(a => a.Job.CompanyId == company.Id);

        if (request.JobId.HasValue)
        {
            query = query.Where(a => a.JobId == request.JobId.Value);
        }

        if (request.SortByScore)
        {
            query = query.OrderByDescending(a => a.AiMatchScore ?? -1).ThenByDescending(a => a.AppliedAtUtc);
        }
        else
        {
            query = query.OrderByDescending(a => a.AppliedAtUtc);
        }

        var applications = await query
            .Select(a => new EmployerApplicantDto(
                a.Id,
                a.JobId,
                a.Job.Title,
                a.SeekerProfile.User.FullName,
                a.SeekerProfile.User.Email ?? string.Empty,
                a.ResumeUrl,
                a.CoverLetter,
                (int)a.Status,
                a.AppliedAtUtc,
                a.EmployerNotes,
                a.StatusHistories
                    .OrderByDescending(h => h.CreatedAtUtc)
                    .Select(h => new ApplicationStatusHistoryDto(h.Id, h.FromStatus, h.ToStatus, h.Note, h.CreatedAtUtc))
                    .ToList(),
                a.AiMatchScore,
                a.AiSkillsScore,
                a.AiExperienceScore,
                a.AiStrengths,
                a.AiMissingSkills,
                a.AiRecommendation,
                a.AiScoredAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result<List<EmployerApplicantDto>>.Success(applications);
    }
}
