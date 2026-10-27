using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class WorkExperience : BaseEntity
{
    public Guid JobSeekerProfileId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }

    public virtual JobSeekerProfile SeekerProfile { get; set; } = null!;
}
