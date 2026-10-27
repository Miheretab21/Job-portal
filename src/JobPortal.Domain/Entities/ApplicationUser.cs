using Microsoft.AspNetCore.Identity;
using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>, IAuditableEntity, ISoftDelete
{
    public ApplicationUser()
    {
        Id = Guid.CreateVersion7();
        SecurityStamp = Guid.NewGuid().ToString();
    }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public UserRole Role { get; set; } = UserRole.JobSeeker;
    public string? AvatarUrl { get; set; }

    // Navigation properties
    public virtual JobSeekerProfile? SeekerProfile { get; set; }
    public virtual Company? Company { get; set; }
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    // Auditing & Soft Delete
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public string? DeletedBy { get; set; }
}
