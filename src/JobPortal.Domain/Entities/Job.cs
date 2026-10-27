using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class Job : BaseEntity, ISoftDelete
{
    public Guid CompanyId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public string Location { get; set; } = string.Empty;
    public JobType JobType { get; set; } = JobType.FullTime;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.MidLevel;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "USD";
    public bool IsRemote { get; set; }
    public DateTime? DeadlineUtc { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Published;
    public int ViewsCount { get; set; }
    public int NumberOfPositions { get; set; } = 1;
    public string? EducationLevel { get; set; }
    public string? YearsOfExperience { get; set; }
    public string? LanguageRequirements { get; set; }
    public bool IsSalaryNegotiable { get; set; }
    public string? AmharicTitle { get; set; }
    public string? AmharicDescription { get; set; }
    public string? City { get; set; }

    // Postgres xmin optimistic concurrency token
    public uint Version { get; set; }

    // Navigation
    public virtual Company Company { get; set; } = null!;
    public virtual JobCategory Category { get; set; } = null!;
    public virtual ICollection<JobSkill> JobSkills { get; set; } = [];
    public virtual ICollection<JobApplication> Applications { get; set; } = [];
    public virtual ICollection<SavedJob> SavedBySeekers { get; set; } = [];

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }
}
