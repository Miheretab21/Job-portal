using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Employer.Queries;

public record GetEmployerDashboardSummaryQuery : IRequest<Result<EmployerDashboardSummaryDto>>;

public class GetEmployerDashboardSummaryQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<GetEmployerDashboardSummaryQuery, Result<EmployerDashboardSummaryDto>>
{
    public async Task<Result<EmployerDashboardSummaryDto>> Handle(GetEmployerDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<EmployerDashboardSummaryDto>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value, cancellationToken);

        if (company is null)
        {
            return Result<EmployerDashboardSummaryDto>.Failure("Employer profile or company not found.");
        }

        var activeJobs = await context.Jobs
            .CountAsync(j => j.CompanyId == company.Id && j.Status == JobStatus.Published, cancellationToken);

        var totalApplicants = await context.JobApplications
            .CountAsync(a => a.Job.CompanyId == company.Id, cancellationToken);

        var shortlisted = await context.JobApplications
            .CountAsync(a => a.Job.CompanyId == company.Id && a.Status == ApplicationStatus.Shortlisted, cancellationToken);

        var interviews = await context.JobApplications
            .CountAsync(a => a.Job.CompanyId == company.Id && a.Status == ApplicationStatus.Interview, cancellationToken);

        var dto = new EmployerDashboardSummaryDto(activeJobs, totalApplicants, shortlisted, interviews);
        return Result<EmployerDashboardSummaryDto>.Success(dto);
    }
}
