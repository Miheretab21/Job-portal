using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class ApplicationStatusHistory : BaseEntity
{
    public Guid JobApplicationId { get; set; }
    public ApplicationStatus FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public string? Note { get; set; }
    public Guid? ChangedByUserId { get; set; }

    public virtual JobApplication JobApplication { get; set; } = null!;
}
