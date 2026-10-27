using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }

    public virtual ICollection<JobSeekerSkill> SeekerSkills { get; set; } = [];
    public virtual ICollection<JobSkill> JobSkills { get; set; } = [];
}
