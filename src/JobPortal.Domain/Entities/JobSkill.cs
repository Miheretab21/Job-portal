namespace JobPortal.Domain.Entities;

public class JobSkill
{
    public Guid JobId { get; set; }
    public Guid SkillId { get; set; }
    public bool IsRequired { get; set; } = true;

    public virtual Job Job { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}
