using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobPortal.Domain.Entities;

namespace JobPortal.Infrastructure.Persistence.Configurations;

public class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.HasKey(j => j.Id);

        builder.Property(j => j.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(j => j.Description)
            .IsRequired();

        builder.Property(j => j.Location)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(j => j.SalaryCurrency)
            .HasMaxLength(10)
            .HasDefaultValue("USD");

        builder.Property(j => j.SalaryMin)
            .HasPrecision(18, 2);

        builder.Property(j => j.SalaryMax)
            .HasPrecision(18, 2);

        builder.Property(j => j.EducationLevel)
            .HasMaxLength(100);

        builder.Property(j => j.YearsOfExperience)
            .HasMaxLength(100);

        builder.Property(j => j.LanguageRequirements)
            .HasMaxLength(150);

        builder.Property(j => j.AmharicTitle)
            .HasMaxLength(250);

        builder.Property(j => j.City)
            .HasMaxLength(100);

        builder.Property(j => j.NumberOfPositions)
            .HasDefaultValue(1);

        builder.Property(j => j.IsSalaryNegotiable)
            .HasDefaultValue(false);

        // Optimistic concurrency using PostgreSQL xmin system column
        builder.Property(j => j.Version)
            .IsRowVersion();

        // Global query filter for soft delete
        builder.HasQueryFilter(j => !j.IsDeleted);

        builder.HasOne(j => j.Company)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(j => j.Category)
            .WithMany(c => c.Jobs)
            .HasForeignKey(j => j.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(j => j.Title);
        builder.HasIndex(j => j.Location);
        builder.HasIndex(j => j.Status);
        builder.HasIndex(j => j.CreatedAtUtc);
    }
}
