using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Auth.DTOs;

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    UserRole Role,
    string? AvatarUrl,
    Guid? CompanyId,
    Guid? SeekerProfileId
);
