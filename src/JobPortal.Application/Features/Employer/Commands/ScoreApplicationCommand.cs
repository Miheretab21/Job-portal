using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Commands;

public record ScoreApplicationCommand(Guid ApplicationId) : IRequest<Result<AiScoreResult>>;

public class ScoreApplicationCommandHandler(
    IAiResumeScoringService scoringService) : IRequestHandler<ScoreApplicationCommand, Result<AiScoreResult>>
{
    public async Task<Result<AiScoreResult>> Handle(ScoreApplicationCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await scoringService.EvaluateApplicationAsync(request.ApplicationId, cancellationToken);
            return Result<AiScoreResult>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<AiScoreResult>.Failure(ex.Message);
        }
    }
}
