using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobPortal.Domain.Entities;

namespace JobPortal.Infrastructure.Persistence.Configurations;

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ResumeUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(a => a.CoverLetter)
            .HasMaxLength(4000);

        builder.Property(a => a.AiRecommendation)
            .HasMaxLength(500);

        builder.Property(a => a.AiStrengths)
            .HasMaxLength(4000);

        builder.Property(a => a.AiMissingSkills)
            .HasMaxLength(4000);

        builder.HasIndex(a => new { a.JobId, a.AiMatchScore });

        builder.HasQueryFilter(a => !a.IsDeleted);

        builder.HasOne(a => a.Job)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.SeekerProfile)
            .WithMany(p => p.Applications)
            .HasForeignKey(a => a.JobSeekerProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.StatusHistories)
            .WithOne(h => h.JobApplication)
            .HasForeignKey(h => h.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique index on (JobId, JobSeekerProfileId) to prevent duplicate applications
        builder.HasIndex(a => new { a.JobId, a.JobSeekerProfileId })
            .IsUnique();
    }
}
