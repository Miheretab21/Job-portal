using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Applications.DTOs;

public record ApplicationDto(
    Guid Id,
    Guid JobId,
    string JobTitle,
    string CompanyName,
    string? CompanyLogoUrl,
    string Location,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string SalaryCurrency,
    bool IsRemote,
    ApplicationStatus Status,
    DateTime AppliedAtUtc,
    string ResumeUrl,
    string? CoverLetter,
    List<ApplicationStatusHistoryDto> StatusHistory,
    string? NextStep = null
);

public record ApplicationStatusHistoryDto(
    Guid Id,
    ApplicationStatus FromStatus,
    ApplicationStatus ToStatus,
    string? Note,
    DateTime ChangedAtUtc
);
