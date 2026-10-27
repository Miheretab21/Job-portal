using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobPortal.Domain.Entities;

namespace JobPortal.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.Website)
            .HasMaxLength(255);

        builder.Property(c => c.Location)
            .HasMaxLength(150);

        builder.Property(c => c.Industry)
            .HasMaxLength(100);

        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.HasOne(c => c.EmployerUser)
            .WithOne(u => u.Company)
            .HasForeignKey<Company>(c => c.EmployerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.Name);
    }
}
