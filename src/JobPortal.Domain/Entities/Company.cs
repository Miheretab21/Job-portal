using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Company : BaseEntity, ISoftDelete
{
    public Guid EmployerUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Location { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public int? FoundedYear { get; set; }
    public bool IsVerified { get; set; }

    // Navigation
    public virtual ApplicationUser EmployerUser { get; set; } = null!;
    public virtual ICollection<Job> Jobs { get; set; } = [];

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }
}
