using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Employer.Commands;

public record UpdateApplicantStageCommand(Guid ApplicationId, int NewStatus, string? Notes) : IRequest<Result<bool>>;

public class UpdateApplicantStageCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    INotificationService notificationService) : IRequestHandler<UpdateApplicantStageCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(UpdateApplicantStageCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<bool>.Failure("Unauthorized.");
        }

        var application = await context.JobApplications
            .Include(a => a.Job)
                .ThenInclude(j => j.Company)
            .Include(a => a.SeekerProfile)
            .FirstOrDefaultAsync(a => a.Id == command.ApplicationId, cancellationToken);

        if (application is null)
        {
            return Result<bool>.Failure("Application not found.");
        }

        if (application.Job.Company.EmployerUserId != userId.Value)
        {
            return Result<bool>.Failure("You do not have permission to manage this applicant.");
        }

        var previousStatus = application.Status;
        var targetStatus = (ApplicationStatus)command.NewStatus;
        application.Status = targetStatus;

        if (!string.IsNullOrWhiteSpace(command.Notes))
        {
            application.EmployerNotes = command.Notes.Trim();
        }

        var historyNote = string.IsNullOrWhiteSpace(command.Notes)
            ? $"Application stage transitioned to {targetStatus} by employer."
            : command.Notes.Trim();

        var history = new ApplicationStatusHistory
        {
            JobApplicationId = application.Id,
            FromStatus = previousStatus,
            ToStatus = targetStatus,
            Note = historyNote,
            ChangedByUserId = userId.Value
        };

        context.ApplicationStatusHistories.Add(history);
        await context.SaveChangesAsync(cancellationToken);

        // Push real-time SignalR notification to candidate
        try
        {
            var seekerUserId = application.SeekerProfile.UserId;
            await notificationService.SendNotificationToUserAsync(
                seekerUserId,
                "Application Stage Updated",
                $"Your application for '{application.Job.Title}' was moved to {targetStatus}.",
                "ApplicationStageUpdated",
                new
                {
                    applicationId = application.Id,
                    jobId = application.JobId,
                    status = (int)targetStatus,
                    notes = command.Notes
                },
                cancellationToken
            );
        }
        catch
        {
            // Fail gracefully if notification cannot be sent
        }

        return Result<bool>.Success(true);
    }
}
