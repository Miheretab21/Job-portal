using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Queries;

public record GetEmployerJobsQuery : IRequest<Result<List<EmployerJobItemDto>>>;

public class GetEmployerJobsQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<GetEmployerJobsQuery, Result<List<EmployerJobItemDto>>>
{
    public async Task<Result<List<EmployerJobItemDto>>> Handle(GetEmployerJobsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<List<EmployerJobItemDto>>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value, cancellationToken);

        if (company is null)
        {
            return Result<List<EmployerJobItemDto>>.Failure("Employer profile or company not found.");
        }

        var jobs = await context.Jobs
            .AsNoTracking()
            .Where(j => j.CompanyId == company.Id)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Select(j => new EmployerJobItemDto(
                j.Id,
                j.Title,
                j.Category.Name,
                j.Location,
                j.IsRemote,
                (int)j.JobType,
                (int)j.Status,
                j.ViewsCount,
                j.Applications.Count(a => !a.IsDeleted),
                j.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result<List<EmployerJobItemDto>>.Success(jobs);
    }
}
