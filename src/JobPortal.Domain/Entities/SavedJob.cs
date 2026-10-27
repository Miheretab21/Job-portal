namespace JobPortal.Domain.Entities;

public class SavedJob
{
    public Guid JobSeekerProfileId { get; set; }
    public Guid JobId { get; set; }
    public DateTime SavedAtUtc { get; set; } = DateTime.UtcNow;

    public virtual JobSeekerProfile SeekerProfile { get; set; } = null!;
    public virtual Job Job { get; set; } = null!;
}
