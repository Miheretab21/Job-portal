using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class JobCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }

    public virtual ICollection<Job> Jobs { get; set; } = [];
}
