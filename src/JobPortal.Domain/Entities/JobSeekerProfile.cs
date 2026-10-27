using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class JobSeekerProfile : BaseEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public string? Headline { get; set; }
    public string? Summary { get; set; }
    public string? ResumeUrl { get; set; }
    public string? ResumeOriginalFileName { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? GitHubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? PhoneNumber { get; set; }
    public int? ExpectedSalary { get; set; }
    public bool IsOpenToWork { get; set; } = true;

    // Navigation
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ICollection<Education> Educations { get; set; } = [];
    public virtual ICollection<WorkExperience> WorkExperiences { get; set; } = [];
    public virtual ICollection<JobSeekerSkill> SeekerSkills { get; set; } = [];
    public virtual ICollection<JobApplication> Applications { get; set; } = [];
    public virtual ICollection<SavedJob> SavedJobs { get; set; } = [];

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }
}
