using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Commands;

public record BatchScoreJobApplicantsCommand(Guid JobId) : IRequest<Result<int>>;

public class BatchScoreJobApplicantsCommandHandler(
    IApplicationDbContext context,
    IAiResumeScoringService scoringService) : IRequestHandler<BatchScoreJobApplicantsCommand, Result<int>>
{
    public async Task<Result<int>> Handle(BatchScoreJobApplicantsCommand request, CancellationToken cancellationToken)
    {
        var applicationIds = await context.JobApplications
            .Where(a => a.JobId == request.JobId && !a.IsDeleted)
            .Select(a => a.Id)
            .ToListAsync(cancellationToken);

        int scoredCount = 0;
        foreach (var appId in applicationIds)
        {
            try
            {
                await scoringService.EvaluateApplicationAsync(appId, cancellationToken);
                scoredCount++;
            }
            catch
            {
                // Continue batch execution on failure of individual application
            }
        }

        return Result<int>.Success(scoredCount);
    }
}
