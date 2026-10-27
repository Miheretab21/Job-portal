using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Employer.Commands;

public record UpdateJobStatusCommand(Guid JobId, int NewStatus) : IRequest<Result<bool>>;

public class UpdateJobStatusCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateJobStatusCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UpdateJobStatusCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<bool>.Failure("Unauthorized.");
        }

        var job = await context.Jobs
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == command.JobId, cancellationToken);

        if (job is null)
        {
            return Result<bool>.Failure("Job not found.");
        }

        if (job.Company.EmployerUserId != userId.Value)
        {
            return Result<bool>.Failure("You do not have permission to manage this job listing.");
        }

        job.Status = (JobStatus)command.NewStatus;
        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
