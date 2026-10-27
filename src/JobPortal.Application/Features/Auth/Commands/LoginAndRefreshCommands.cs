using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Auth.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponseDto>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class LoginCommandHandler(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext context,
    IJwtTokenService jwtTokenService)
    : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .Include(u => u.Company)
            .Include(u => u.SeekerProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Result<AuthResponseDto>.Failure("Invalid email or password.");
        }

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
            user.Company?.Id,
            user.SeekerProfile?.Id
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(
            accessToken,
            rawRefreshToken,
            expiresAtUtc,
            userDto
        ));
    }
}

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<AuthResponseDto>>;

public class RefreshTokenCommandHandler(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext context,
    IJwtTokenService jwtTokenService)
    : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = jwtTokenService.HashToken(request.RefreshToken);

        var existingToken = await context.RefreshTokens
            .Include(rt => rt.User).ThenInclude(u => u.Company)
            .Include(rt => rt.User).ThenInclude(u => u.SeekerProfile)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        if (existingToken == null || !existingToken.IsActive)
        {
            return Result<AuthResponseDto>.Failure("Invalid or expired refresh token.");
        }

        // Revoke the old token
        existingToken.IsRevoked = true;
        existingToken.RevokedAtUtc = DateTime.UtcNow;

        // Generate new pair (Token Rotation)
        var user = existingToken.User;
        var roles = await userManager.GetRolesAsync(user);
        var newAccessToken = jwtTokenService.GenerateAccessToken(user, roles);
        var (newRawRefreshToken, newTokenHash, newExpiresAtUtc) = jwtTokenService.GenerateRefreshToken();

        existingToken.ReplacedByTokenHash = newTokenHash;

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newTokenHash,
            ExpiresAtUtc = newExpiresAtUtc
        };

        context.RefreshTokens.Add(newRefreshTokenEntity);
        await context.SaveChangesAsync(cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            user.AvatarUrl,
            user.Company?.Id,
            user.SeekerProfile?.Id
        );

        return Result<AuthResponseDto>.Success(new AuthResponseDto(
            newAccessToken,
            newRawRefreshToken,
            newExpiresAtUtc,
            userDto
        ));
    }
}
