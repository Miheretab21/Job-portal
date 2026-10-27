using FluentValidation;
using Microsoft.AspNetCore.Identity;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Auth.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Auth.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    UserRole Role,
    string? CompanyName
) : IRequest<Result<AuthResponseDto>>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).IsInEnum();
        When(x => x.Role == UserRole.Employer, () =>
        {
            RuleFor(x => x.CompanyName).NotEmpty().WithMessage("Company name is required for employer registration.");
        });
    }
}

public class RegisterCommandHandler(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext context,
    IJwtTokenService jwtTokenService)
    : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing != null)
        {
            return Result<AuthResponseDto>.Failure("An account with this email address already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Role = request.Role,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Result<AuthResponseDto>.Failure(result.Errors.Select(e => e.Description));
        }

        var roleName = request.Role == UserRole.Employer ? Roles.Employer : Roles.JobSeeker;
        await userManager.AddToRoleAsync(user, roleName);

        Guid? companyId = null;
        Guid? profileId = null;

        if (request.Role == UserRole.JobSeeker)
        {
            var profile = new JobSeekerProfile
            {
                UserId = user.Id
            };
            context.JobSeekerProfiles.Add(profile);
            profileId = profile.Id;
        }
        else if (request.Role == UserRole.Employer && !string.IsNullOrWhiteSpace(request.CompanyName))
        {
            var company = new Company
            {
                EmployerUserId = user.Id,
                Name = request.CompanyName.Trim(),
                IsVerified = false
            };
            context.Companies.Add(company);
            companyId = company.Id;
        }

        // Generate tokens
        var roles = await userManager.GetRolesAsync(user);
        var accessToken = jwtTokenService.GenerateAccessToken(user, roles);
        var (rawRefreshToken, tokenHash, expiresAtUtc) = jwtTokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAtUtc = expiresAtUtc
        };

        context.RefreshTokens.Add(refreshTokenEntity);
        await context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            user.AvatarUrl,
            companyId,
            profileId
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(
            accessToken,
            rawRefreshToken,
            expiresAtUtc,
            userDto
        ));
    }
}
