namespace JobPortal.Application.Common.Interfaces;

public record AiScoreResult(
    int MatchScore,
    int SkillsScore,
    int ExperienceScore,
    List<string> Strengths,
    List<string> MissingSkills,
    string Recommendation
);

public interface IAiResumeScoringService
{
    Task<AiScoreResult> EvaluateApplicationAsync(
        Guid applicationId, 
        CancellationToken cancellationToken = default);
}
