using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Applications.Commands;

public record WithdrawApplicationCommand(Guid ApplicationId) : IRequest<Result>;

public class WithdrawApplicationCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<WithdrawApplicationCommand, Result>
{
    public async Task<Result> Handle(WithdrawApplicationCommand request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result.Failure("User must be authenticated.");
        }

        var userId = currentUserService.UserId.Value;

        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            return Result.Failure("Job seeker profile not found.");
        }

        var application = await context.JobApplications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.JobSeekerProfileId == profile.Id && !a.IsDeleted, cancellationToken);

        if (application == null)
        {
            return Result.Failure("Application not found or already withdrawn.");
        }

        var oldStatus = application.Status;
        application.Status = Domain.Enums.ApplicationStatus.Withdrawn;
        application.UpdatedAtUtc = DateTime.UtcNow;

        context.ApplicationStatusHistories.Add(new Domain.Entities.ApplicationStatusHistory
        {
            JobApplicationId = application.Id,
            FromStatus = oldStatus,
            ToStatus = Domain.Enums.ApplicationStatus.Withdrawn,
            Note = "Application withdrawn by candidate.",
            ChangedByUserId = userId
        });

        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
