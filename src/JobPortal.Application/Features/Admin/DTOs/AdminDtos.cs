using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Admin.DTOs;

public record PlatformAnalyticsDto(
    int TotalUsers,
    int SeekerCount,
    int EmployerCount,
    int AdminCount,
    int TotalJobs,
    int PublishedJobs,
    int DraftJobs,
    int ArchivedJobs,
    int TotalApplications,
    int HiredApplications,
    int InReviewApplications,
    int RejectedApplications,
    int TotalCategories,
    int TotalCompanies,
    List<TopCategoryMetricDto> TopCategories,
    List<PlatformActivityDto> RecentActivities
);

public record TopCategoryMetricDto(
    Guid Id,
    string Name,
    string Slug,
    string? Icon,
    int ActiveJobsCount
);

public record PlatformActivityDto(
    string Type,
    string Title,
    string Description,
    DateTime TimestampUtc
);

public record AdminJobDto(
    Guid Id,
    string Title,
    Guid CompanyId,
    string CompanyName,
    string? CompanyLogoUrl,
    Guid CategoryId,
    string CategoryName,
    string Location,
    bool IsRemote,
    JobStatus Status,
    int ViewsCount,
    int ApplicationsCount,
    DateTime CreatedAtUtc
);

public record AdminUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    UserRole Role,
    bool IsLocked,
    DateTime? LockoutEndUtc,
    string? CompanyName,
    int ApplicationsCount,
    DateTime CreatedAtUtc,
    Guid? CompanyId = null,
    bool? IsCompanyVerified = null,
    string? CompanyLogoUrl = null
);

public record CreateCategoryRequest(
    string Name,
    string Slug,
    string? Description,
    string? Icon
);

public record UpdateCategoryRequest(
    string Name,
    string Slug,
    string? Description,
    string? Icon
);
