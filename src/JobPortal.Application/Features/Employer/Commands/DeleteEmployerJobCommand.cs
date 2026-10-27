using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Commands;

public record DeleteEmployerJobCommand(Guid JobId) : IRequest<Result<bool>>;

public class DeleteEmployerJobCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<DeleteEmployerJobCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteEmployerJobCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<bool>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value && !c.IsDeleted, cancellationToken);

        if (company is null)
        {
            return Result<bool>.Failure("Employer company profile not found.");
        }

        var job = await context.Jobs
            .FirstOrDefaultAsync(j => j.Id == command.JobId && j.CompanyId == company.Id && !j.IsDeleted, cancellationToken);

        if (job is null)
        {
            return Result<bool>.Failure("Job requisition not found or does not belong to your company.");
        }

        job.IsDeleted = true;
        job.DeletedAtUtc = DateTime.UtcNow;
        job.DeletedBy = userId.ToString();

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
