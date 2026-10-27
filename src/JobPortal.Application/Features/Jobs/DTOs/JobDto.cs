using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Jobs.DTOs;

public record JobDto(
    Guid Id,
    string Title,
    string Description,
    string? Requirements,
    string? Benefits,
    string Location,
    JobType JobType,
    ExperienceLevel ExperienceLevel,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string SalaryCurrency,
    bool IsRemote,
    DateTime? DeadlineUtc,
    JobStatus Status,
    int ViewsCount,
    DateTime CreatedAtUtc,
    CompanySummaryDto Company,
    CategorySummaryDto Category,
    List<string> Skills,
    int NumberOfPositions = 1,
    string? EducationLevel = null,
    string? YearsOfExperience = null,
    string? LanguageRequirements = null,
    bool IsSalaryNegotiable = false,
    string? AmharicTitle = null,
    string? AmharicDescription = null,
    string? City = null
);

public record JobListDto(
    Guid Id,
    string Title,
    string Location,
    JobType JobType,
    ExperienceLevel ExperienceLevel,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string SalaryCurrency,
    bool IsRemote,
    DateTime CreatedAtUtc,
    DateTime? DeadlineUtc,
    CompanySummaryDto Company,
    CategorySummaryDto Category,
    List<string> Skills,
    int NumberOfPositions = 1,
    string? EducationLevel = null,
    string? YearsOfExperience = null,
    string? LanguageRequirements = null,
    bool IsSalaryNegotiable = false,
    string? AmharicTitle = null,
    string? AmharicDescription = null,
    string? City = null
);

public record CompanySummaryDto(
    Guid Id,
    string Name,
    string? LogoUrl,
    string? Location,
    bool IsVerified,
    string? Description = null,
    string? Website = null,
    string? Industry = null,
    string? CompanySize = null
);
public record CategorySummaryDto(Guid Id, string Name, string Slug, string? Icon);
