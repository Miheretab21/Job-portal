using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Education : BaseEntity
{
    public Guid JobSeekerProfileId { get; set; }
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }

    public virtual JobSeekerProfile SeekerProfile { get; set; } = null!;
}
