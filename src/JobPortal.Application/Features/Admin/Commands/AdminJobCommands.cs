using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Admin.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Admin.Commands;

public record GetAdminJobsQuery(JobStatus? Status = null) : IRequest<Result<List<AdminJobDto>>>;

public class GetAdminJobsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminJobsQuery, Result<List<AdminJobDto>>>
{
    public async Task<Result<List<AdminJobDto>>> Handle(GetAdminJobsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Jobs
            .Where(j => !j.IsDeleted);

        if (request.Status.HasValue)
        {
            query = query.Where(j => j.Status == request.Status.Value);
        }

        var jobs = await query
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.Applications)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Select(j => new AdminJobDto(
                j.Id,
                j.Title,
                j.CompanyId,
                j.Company.Name,
                j.Company.LogoUrl,
                j.CategoryId,
                j.Category.Name,
                j.Location,
                j.IsRemote,
                j.Status,
                j.ViewsCount,
                j.Applications.Count(a => !a.IsDeleted),
                j.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Result<List<AdminJobDto>>.Success(jobs);
    }
}

public record UpdateJobStatusByAdminCommand(Guid JobId, JobStatus Status) : IRequest<Result<AdminJobDto>>;

public class UpdateJobStatusByAdminCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<UpdateJobStatusByAdminCommand, Result<AdminJobDto>>
{
    public async Task<Result<AdminJobDto>> Handle(UpdateJobStatusByAdminCommand request, CancellationToken cancellationToken)
    {
        var job = await context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Category)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == request.JobId && !j.IsDeleted, cancellationToken);

        if (job == null)
        {
            return Result<AdminJobDto>.Failure("Job requisition not found.");
        }

        job.Status = request.Status;
        job.UpdatedAtUtc = dateTimeProvider.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        var dto = new AdminJobDto(
            job.Id,
            job.Title,
            job.CompanyId,
            job.Company.Name,
            job.Company.LogoUrl,
            job.CategoryId,
            job.Category.Name,
            job.Location,
            job.IsRemote,
            job.Status,
            job.ViewsCount,
            job.Applications.Count(a => !a.IsDeleted),
            job.CreatedAtUtc
        );

        return Result<AdminJobDto>.Success(dto);
    }
}

public record DeleteJobByAdminCommand(Guid JobId) : IRequest<Result<bool>>;

public class DeleteJobByAdminCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<DeleteJobByAdminCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteJobByAdminCommand request, CancellationToken cancellationToken)
    {
        var job = await context.Jobs
            .FirstOrDefaultAsync(j => j.Id == request.JobId && !j.IsDeleted, cancellationToken);

        if (job == null)
        {
            return Result<bool>.Failure("Job requisition not found.");
        }

        job.IsDeleted = true;
        job.DeletedAtUtc = dateTimeProvider.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
