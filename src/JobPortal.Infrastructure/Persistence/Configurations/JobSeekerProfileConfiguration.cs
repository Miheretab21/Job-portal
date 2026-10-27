using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobPortal.Domain.Entities;

namespace JobPortal.Infrastructure.Persistence.Configurations;

public class JobSeekerProfileConfiguration : IEntityTypeConfiguration<JobSeekerProfile>
{
    public void Configure(EntityTypeBuilder<JobSeekerProfile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Headline)
            .HasMaxLength(200);

        builder.Property(p => p.Location)
            .HasMaxLength(150);

        builder.Property(p => p.PhoneNumber)
            .HasMaxLength(50);

        builder.HasQueryFilter(p => !p.IsDeleted);

        builder.HasOne(p => p.User)
            .WithOne(u => u.SeekerProfile)
            .HasForeignKey<JobSeekerProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Educations)
            .WithOne(e => e.SeekerProfile)
            .HasForeignKey(e => e.JobSeekerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.WorkExperiences)
            .WithOne(w => w.SeekerProfile)
            .HasForeignKey(w => w.JobSeekerProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
