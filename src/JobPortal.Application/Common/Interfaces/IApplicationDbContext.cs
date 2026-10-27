using Microsoft.EntityFrameworkCore;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<JobSeekerProfile> JobSeekerProfiles { get; }
    DbSet<Education> Educations { get; }
    DbSet<WorkExperience> WorkExperiences { get; }
    DbSet<Skill> Skills { get; }
    DbSet<JobSeekerSkill> JobSeekerSkills { get; }
    DbSet<Company> Companies { get; }
    DbSet<JobCategory> JobCategories { get; }
    DbSet<Job> Jobs { get; }
    DbSet<JobSkill> JobSkills { get; }
    DbSet<JobApplication> JobApplications { get; }
    DbSet<ApplicationStatusHistory> ApplicationStatusHistories { get; }
    DbSet<SavedJob> SavedJobs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
