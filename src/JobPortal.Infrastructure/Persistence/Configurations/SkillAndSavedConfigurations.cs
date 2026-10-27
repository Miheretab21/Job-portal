using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobPortal.Domain.Entities;

namespace JobPortal.Infrastructure.Persistence.Configurations;

public class JobSkillConfiguration : IEntityTypeConfiguration<JobSkill>
{
    public void Configure(EntityTypeBuilder<JobSkill> builder)
    {
        builder.HasKey(js => new { js.JobId, js.SkillId });

        builder.HasOne(js => js.Job)
            .WithMany(j => j.JobSkills)
            .HasForeignKey(js => js.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(js => js.Skill)
            .WithMany(s => s.JobSkills)
            .HasForeignKey(js => js.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class JobSeekerSkillConfiguration : IEntityTypeConfiguration<JobSeekerSkill>
{
    public void Configure(EntityTypeBuilder<JobSeekerSkill> builder)
    {
        builder.HasKey(jss => new { jss.JobSeekerProfileId, jss.SkillId });

        builder.HasOne(jss => jss.SeekerProfile)
            .WithMany(p => p.SeekerSkills)
            .HasForeignKey(jss => jss.JobSeekerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(jss => jss.Skill)
            .WithMany(s => s.SeekerSkills)
            .HasForeignKey(jss => jss.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SavedJobConfiguration : IEntityTypeConfiguration<SavedJob>
{
    public void Configure(EntityTypeBuilder<SavedJob> builder)
    {
        builder.HasKey(sj => new { sj.JobSeekerProfileId, sj.JobId });

        builder.HasOne(sj => sj.SeekerProfile)
            .WithMany(p => p.SavedJobs)
            .HasForeignKey(sj => sj.JobSeekerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sj => sj.Job)
            .WithMany(j => j.SavedBySeekers)
            .HasForeignKey(sj => sj.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
