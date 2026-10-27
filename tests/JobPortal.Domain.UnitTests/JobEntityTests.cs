using Xunit;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.UnitTests;

public class JobEntityTests
{
    [Fact]
    public void Job_Should_Initialize_With_Correct_Default_Values()
    {
        var job = new Job
        {
            Title = "Senior Cloud Architect",
            Location = "Remote, US"
        };

        Assert.Equal("Senior Cloud Architect", job.Title);
        Assert.Equal("Remote, US", job.Location);
        Assert.Equal(JobStatus.Published, job.Status);
        Assert.Equal(ExperienceLevel.MidLevel, job.ExperienceLevel);
        Assert.Equal(JobType.FullTime, job.JobType);
        Assert.Equal("USD", job.SalaryCurrency);
        Assert.False(job.IsDeleted);
        Assert.NotNull(job.JobSkills);
        Assert.NotNull(job.Applications);
        Assert.NotNull(job.SavedBySeekers);
    }

    [Fact]
    public void Job_Salary_Range_Should_Be_Configurable()
    {
        var job = new Job
        {
            Title = "Staff Distributed Systems Engineer",
            SalaryMin = 180000m,
            SalaryMax = 240000m,
            SalaryCurrency = "USD",
            IsRemote = true
        };

        Assert.Equal(180000m, job.SalaryMin);
        Assert.Equal(240000m, job.SalaryMax);
        Assert.True(job.IsRemote);
        Assert.True(job.SalaryMax > job.SalaryMin);
    }

    [Fact]
    public void Job_SoftDelete_Should_Update_State()
    {
        var job = new Job { Title = "Temporary Role" };
        var deleteTime = DateTime.UtcNow;

        job.IsDeleted = true;
        job.DeletedAtUtc = deleteTime;
        job.DeletedBy = "admin@jobportal.com";

        Assert.True(job.IsDeleted);
        Assert.Equal(deleteTime, job.DeletedAtUtc);
        Assert.Equal("admin@jobportal.com", job.DeletedBy);
    }
}

public class JobApplicationTests
{
    [Fact]
    public void JobApplication_Should_Initialize_With_Submitted_Status()
    {
        var app = new JobApplication
        {
            JobId = Guid.NewGuid(),
            JobSeekerProfileId = Guid.NewGuid(),
            ResumeUrl = "https://example.com/cv.pdf"
        };

        Assert.Equal(ApplicationStatus.Submitted, app.Status);
        Assert.False(app.IsDeleted);
        Assert.NotNull(app.StatusHistories);
    }

    [Theory]
    [InlineData(ApplicationStatus.InReview)]
    [InlineData(ApplicationStatus.Shortlisted)]
    [InlineData(ApplicationStatus.Interview)]
    [InlineData(ApplicationStatus.Rejected)]
    [InlineData(ApplicationStatus.Hired)]
    public void JobApplication_Status_Transitions_Should_Be_Valid(ApplicationStatus targetStatus)
    {
        var app = new JobApplication
        {
            JobId = Guid.NewGuid(),
            JobSeekerProfileId = Guid.NewGuid(),
            ResumeUrl = "https://example.com/cv.pdf"
        };

        app.Status = targetStatus;
        Assert.Equal(targetStatus, app.Status);
    }
}
