using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Infrastructure.Services;

public partial class AiResumeScoringService(IApplicationDbContext context) : IAiResumeScoringService
{
    public async Task<AiScoreResult> EvaluateApplicationAsync(
        Guid applicationId, 
        CancellationToken cancellationToken = default)
    {
        var application = await context.JobApplications
            .Include(a => a.Job)
                .ThenInclude(j => j.JobSkills)
                    .ThenInclude(js => js.Skill)
            .Include(a => a.SeekerProfile)
                .ThenInclude(p => p.SeekerSkills)
                    .ThenInclude(ss => ss.Skill)
            .Include(a => a.SeekerProfile)
                .ThenInclude(p => p.WorkExperiences)
            .Include(a => a.SeekerProfile)
                .ThenInclude(p => p.Educations)
            .FirstOrDefaultAsync(a => a.Id == applicationId && !a.IsDeleted, cancellationToken);

        if (application == null)
        {
            throw new InvalidOperationException($"Job application with ID {applicationId} not found.");
        }

        var job = application.Job;
        var profile = application.SeekerProfile;

        // 1. Gather Job Required Skills
        var jobSkillNames = job.JobSkills
            .Where(js => js.Skill != null)
            .Select(js => js.Skill.Name)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // 2. Gather Candidate Skills & Keywords from Profile
        var candidateSkills = profile.SeekerSkills
            .Where(ss => ss.Skill != null)
            .Select(ss => ss.Skill.Name)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Build candidate full-text corpus
        var profileTextBuilder = new System.Text.StringBuilder();
        if (!string.IsNullOrWhiteSpace(profile.Headline)) profileTextBuilder.AppendLine(profile.Headline);
        if (!string.IsNullOrWhiteSpace(profile.Summary)) profileTextBuilder.AppendLine(profile.Summary);
        if (!string.IsNullOrWhiteSpace(application.CoverLetter)) profileTextBuilder.AppendLine(application.CoverLetter);

        foreach (var exp in profile.WorkExperiences)
        {
            profileTextBuilder.AppendLine($"{exp.JobTitle} {exp.CompanyName} {exp.Description}");
        }

        var candidateCorpus = profileTextBuilder.ToString();

        // 3. Evaluate Skill Matches
        var matchedSkills = new List<string>();
        var missingSkills = new List<string>();

        foreach (var jobSkill in jobSkillNames)
        {
            if (candidateSkills.Contains(jobSkill) || 
                ContainsSkillInText(candidateCorpus, jobSkill))
            {
                matchedSkills.Add(jobSkill);
            }
            else
            {
                missingSkills.Add(jobSkill);
            }
        }

        // Skills Score Calculation
        int skillsScore;
        if (jobSkillNames.Count == 0)
        {
            skillsScore = candidateSkills.Count > 0 ? 85 : 70;
        }
        else
        {
            var matchRatio = (double)matchedSkills.Count / jobSkillNames.Count;
            // Bonus for extra candidate skills beyond requirements
            var bonus = Math.Min(15, candidateSkills.Count * 2);
            skillsScore = Math.Clamp((int)Math.Round(matchRatio * 85 + bonus), 35, 100);
        }

        // 4. Evaluate Experience Alignment
        var totalYearsExp = 0.0;
        foreach (var exp in profile.WorkExperiences)
        {
            var end = exp.IsCurrent ? DateTime.UtcNow : (exp.EndDate ?? DateTime.UtcNow);
            var duration = (end - exp.StartDate).TotalDays / 365.25;
            if (duration > 0) totalYearsExp += duration;
        }

        // Expected years based on ExperienceLevel
        var requiredYears = job.ExperienceLevel switch
        {
            ExperienceLevel.EntryLevel => 0.5,
            ExperienceLevel.MidLevel => 3.0,
            ExperienceLevel.SeniorLevel => 5.0,
            ExperienceLevel.Lead => 7.0,
            ExperienceLevel.Executive => 10.0,
            _ => 2.0
        };

        int experienceScore;
        if (totalYearsExp >= requiredYears)
        {
            experienceScore = 95;
        }
        else if (totalYearsExp >= requiredYears * 0.7)
        {
            experienceScore = 80;
        }
        else if (totalYearsExp >= requiredYears * 0.4)
        {
            experienceScore = 65;
        }
        else
        {
            experienceScore = 45;
        }

        // 5. Composite Match Score
        var compositeScore = Math.Clamp(
            (int)Math.Round(skillsScore * 0.65 + experienceScore * 0.35), 
            25, 
            98
        );

        // 6. Strengths Extraction
        var strengths = new List<string>();
        if (matchedSkills.Count > 0)
        {
            strengths.Add($"Strong match in core competencies: {string.Join(", ", matchedSkills.Take(4))}");
        }
        if (totalYearsExp >= requiredYears)
        {
            strengths.Add($"Meets required seniority level with {totalYearsExp:F1}+ years of documented industry experience");
        }
        if (!string.IsNullOrWhiteSpace(application.CoverLetter))
        {
            strengths.Add("Submitted a tailored candidate introduction letter detailing project impact");
        }
        if (profile.Educations.Any())
        {
            var edu = profile.Educations.First();
            strengths.Add($"Formal qualification: {edu.Degree} in {edu.FieldOfStudy}");
        }

        if (strengths.Count == 0)
        {
            strengths.Add("Foundation background in modern software engineering practices");
        }

        // 7. Recommendation
        string recommendation = compositeScore switch
        {
            >= 85 => "Exceptional Match — Strongly recommended for immediate technical interview.",
            >= 72 => "Strong Candidate — Recommended for initial hiring manager screening.",
            >= 55 => "Moderate Fit — Relevant background; recommend probing secondary skill gaps.",
            _ => "Low Fit — Diverges from core required competencies and experience."
        };

        // 8. Persist Score on JobApplication
        application.AiMatchScore = compositeScore;
        application.AiSkillsScore = skillsScore;
        application.AiExperienceScore = experienceScore;
        application.AiStrengths = JsonSerializer.Serialize(strengths);
        application.AiMissingSkills = JsonSerializer.Serialize(missingSkills);
        application.AiRecommendation = recommendation;
        application.AiScoredAtUtc = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new AiScoreResult(
            compositeScore,
            skillsScore,
            experienceScore,
            strengths,
            missingSkills,
            recommendation
        );
    }

    private static bool ContainsSkillInText(string text, string skill)
    {
        if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(skill))
            return false;

        var pattern = $@"\b{Regex.Escape(skill)}\b";
        return Regex.IsMatch(text, pattern, RegexOptions.IgnoreCase);
    }
}
