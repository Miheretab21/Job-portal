using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Features.SavedJobs.Commands;

public record ToggleSaveJobCommand(Guid JobId) : IRequest<Result<bool>>;

public class ToggleSaveJobCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService)
    : IRequestHandler<ToggleSaveJobCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(ToggleSaveJobCommand request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<bool>.Failure("User must be authenticated.");
        }

        var userId = currentUserService.UserId.Value;

        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            profile = new JobSeekerProfile { UserId = userId };
            context.JobSeekerProfiles.Add(profile);
            await context.SaveChangesAsync(cancellationToken);
        }

        var existing = await context.SavedJobs
            .FirstOrDefaultAsync(s => s.JobSeekerProfileId == profile.Id && s.JobId == request.JobId, cancellationToken);

        if (existing != null)
        {
            // Unsave
            context.SavedJobs.Remove(existing);
            await context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(false);
        }
        else
        {
            // Save
            var savedJob = new SavedJob
            {
                JobSeekerProfileId = profile.Id,
                JobId = request.JobId,
                SavedAtUtc = DateTime.UtcNow
            };
            context.SavedJobs.Add(savedJob);
            await context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
    }
}
