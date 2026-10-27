using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class JobApplication : BaseEntity, ISoftDelete
{
    public Guid JobId { get; set; }
    public Guid JobSeekerProfileId { get; set; }
    public string? CoverLetter { get; set; }
    public string ResumeUrl { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
    public DateTime AppliedAtUtc { get; set; } = DateTime.UtcNow;
    public string? EmployerNotes { get; set; }

    // AI Scoring & Compatibility Analysis
    public int? AiMatchScore { get; set; }
    public int? AiSkillsScore { get; set; }
    public int? AiExperienceScore { get; set; }
    public string? AiStrengths { get; set; }
    public string? AiMissingSkills { get; set; }
    public string? AiRecommendation { get; set; }
    public DateTime? AiScoredAtUtc { get; set; }

    // Navigation
    public virtual Job Job { get; set; } = null!;
    public virtual JobSeekerProfile SeekerProfile { get; set; } = null!;
    public virtual ICollection<ApplicationStatusHistory> StatusHistories { get; set; } = [];

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }
}
