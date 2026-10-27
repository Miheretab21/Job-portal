namespace JobPortal.Domain.Entities;

public class JobSeekerSkill
{
    public Guid JobSeekerProfileId { get; set; }
    public Guid SkillId { get; set; }
    public int? YearsOfExperience { get; set; }

    public virtual JobSeekerProfile SeekerProfile { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}
