using FluentValidation;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Applications.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Applications.Commands;

public record ApplyForJobCommand(
    Guid JobId,
    string ResumeUrl,
    string? CoverLetter
) : IRequest<Result<ApplicationDto>>;

public class ApplyForJobCommandValidator : AbstractValidator<ApplyForJobCommand>
{
    public ApplyForJobCommandValidator()
    {
        RuleFor(x => x.JobId).NotEmpty();
        RuleFor(x => x.ResumeUrl).NotEmpty().MaximumLength(500);
        RuleFor(x => x.CoverLetter).MaximumLength(4000);
    }
}

public class ApplyForJobCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider,
    INotificationService notificationService,
    IAiResumeScoringService scoringService)
    : IRequestHandler<ApplyForJobCommand, Result<ApplicationDto>>
{
    public async Task<Result<ApplicationDto>> Handle(ApplyForJobCommand request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<ApplicationDto>.Failure("User must be authenticated to apply.");
        }

        var userId = currentUserService.UserId.Value;

        // Find or create job seeker profile
        var profile = await context.JobSeekerProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, cancellationToken);

        if (profile == null)
        {
            profile = new JobSeekerProfile
            {
                UserId = userId,
                ResumeUrl = request.ResumeUrl
            };
            context.JobSeekerProfiles.Add(profile);
            await context.SaveChangesAsync(cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.ResumeUrl))
        {
            profile.ResumeUrl = request.ResumeUrl;
        }

        // Verify job exists and is open
        var job = await context.Jobs
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == request.JobId && !j.IsDeleted, cancellationToken);

        if (job == null || job.Status != JobStatus.Published)
        {
            return Result<ApplicationDto>.Failure("Job is not open for applications.");
        }

        // Check for existing application
        var alreadyApplied = await context.JobApplications
            .AnyAsync(a => a.JobId == request.JobId && a.JobSeekerProfileId == profile.Id && !a.IsDeleted, cancellationToken);

        if (alreadyApplied)
        {
            return Result<ApplicationDto>.Failure("You have already applied for this position.");
        }

        var application = new JobApplication
        {
            JobId = request.JobId,
            JobSeekerProfileId = profile.Id,
            ResumeUrl = request.ResumeUrl.Trim(),
            CoverLetter = request.CoverLetter?.Trim(),
            Status = ApplicationStatus.Submitted,
            AppliedAtUtc = dateTimeProvider.UtcNow
        };

        var initialHistory = new ApplicationStatusHistory
        {
            JobApplicationId = application.Id,
            FromStatus = ApplicationStatus.Submitted,
            ToStatus = ApplicationStatus.Submitted,
            Note = "Application received and submitted to employer.",
            ChangedByUserId = userId
        };

        context.JobApplications.Add(application);
        context.ApplicationStatusHistories.Add(initialHistory);
        await context.SaveChangesAsync(cancellationToken);

        // Perform automated AI Resume Match & Compatibility Scoring
        try
        {
            await scoringService.EvaluateApplicationAsync(application.Id, cancellationToken);
        }
        catch
        {
            // Do not fail application submission if AI scoring encounters transient error
        }

        // Push real-time SignalR notification to employer
        try
        {
            var user = await context.Users.FindAsync([userId], cancellationToken);
            var candidateName = user?.FullName ?? "A candidate";
            var employerUserId = job.Company.EmployerUserId;
            await notificationService.SendNotificationToUserAsync(
                employerUserId,
                "New Candidate Application",
                $"{candidateName} just applied for '{job.Title}'.",
                "NewApplicationReceived",
                new { jobId = job.Id, applicationId = application.Id },
                cancellationToken
            );
        }
        catch
        {
            // Fail gracefully if notification cannot be sent
        }

        var dto = new ApplicationDto(
            application.Id,
            job.Id,
            job.Title,
            job.Company.Name,
            job.Company.LogoUrl,
            job.Location,
            job.SalaryMin,
            job.SalaryMax,
            job.SalaryCurrency,
            job.IsRemote,
            application.Status,
            application.AppliedAtUtc,
            application.ResumeUrl,
            application.CoverLetter,
            [
                new ApplicationStatusHistoryDto(
                    initialHistory.Id,
                    initialHistory.FromStatus,
                    initialHistory.ToStatus,
                    initialHistory.Note,
                    initialHistory.CreatedAtUtc
                )
            ]
        );

        return Result<ApplicationDto>.Success(dto);
    }
}
