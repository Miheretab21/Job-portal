using JobPortal.Application.Features.Applications.DTOs;

namespace JobPortal.Application.Features.Employer.DTOs;

public record EmployerDashboardSummaryDto(
    int ActiveJobsCount,
    int TotalApplicantsCount,
    int ShortlistedCount,
    int InterviewsCount
);

public record EmployerJobItemDto(
    Guid Id,
    string Title,
    string CategoryName,
    string Location,
    bool IsRemote,
    int JobType,
    int Status,
    int ViewsCount,
    int ApplicantsCount,
    DateTime CreatedAtUtc
);

public record EmployerApplicantDto(
    Guid ApplicationId,
    Guid JobId,
    string JobTitle,
    string CandidateName,
    string CandidateEmail,
    string ResumeUrl,
    string? CoverLetter,
    int Status,
    DateTime AppliedAtUtc,
    string? EmployerNotes,
    List<ApplicationStatusHistoryDto> StatusHistory,
    int? AiMatchScore = null,
    int? AiSkillsScore = null,
    int? AiExperienceScore = null,
    string? AiStrengths = null,
    string? AiMissingSkills = null,
    string? AiRecommendation = null,
    DateTime? AiScoredAtUtc = null
);

public record CreateJobRequest(
    string Title,
    Guid CategoryId,
    string Description,
    string? Requirements,
    string? Benefits,
    string Location,
    int JobType,
    int ExperienceLevel,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string SalaryCurrency,
    bool IsRemote,
    List<string> SkillNames,
    int NumberOfPositions = 1,
    string? EducationLevel = null,
    string? YearsOfExperience = null,
    string? LanguageRequirements = null,
    bool IsSalaryNegotiable = false,
    string? AmharicTitle = null,
    string? AmharicDescription = null,
    string? City = null,
    DateTime? DeadlineUtc = null,
    string? CompanyDescription = null,
    string? CompanyWebsite = null,
    string? CompanyIndustry = null,
    string? CompanySize = null
);

public record UpdateJobRequest(
    string Title,
    Guid CategoryId,
    string Description,
    string? Requirements,
    string? Benefits,
    string Location,
    int JobType,
    int ExperienceLevel,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string SalaryCurrency,
    bool IsRemote,
    List<string> SkillNames,
    int NumberOfPositions = 1,
    string? EducationLevel = null,
    string? YearsOfExperience = null,
    string? LanguageRequirements = null,
    bool IsSalaryNegotiable = false,
    string? AmharicTitle = null,
    string? AmharicDescription = null,
    string? City = null,
    DateTime? DeadlineUtc = null,
    string? CompanyDescription = null,
    string? CompanyWebsite = null,
    string? CompanyIndustry = null,
    string? CompanySize = null
);

public record UpdateApplicantStageRequest(
    int NewStatus,
    string? Notes
);

public record EmployerCompanyProfileDto(
    Guid Id,
    string Name,
    string? Description,
    string? Website,
    string? Location,
    string? Industry,
    string? CompanySize,
    bool IsVerified,
    string? LogoUrl
);

public record UpdateCompanyProfileRequest(
    string? Name,
    string? Description,
    string? Website,
    string? Location,
    string? Industry,
    string? CompanySize,
    string? LogoUrl = null
);
