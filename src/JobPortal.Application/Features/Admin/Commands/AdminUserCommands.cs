using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Admin.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Features.Admin.Commands;

public record GetAdminUsersQuery(UserRole? Role = null, string? Search = null) : IRequest<Result<List<AdminUserDto>>>;

public class GetAdminUsersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminUsersQuery, Result<List<AdminUserDto>>>
{
    public async Task<Result<List<AdminUserDto>>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
    {
        var query = context.Users
            .Where(u => !u.IsDeleted);

        if (request.Role.HasValue)
        {
            query = query.Where(u => u.Role == request.Role.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.Trim().ToLower();
            query = query.Where(u => u.Email!.ToLower().Contains(s) ||
                                     u.FirstName.ToLower().Contains(s) ||
                                     u.LastName.ToLower().Contains(s));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        // Pre-fetch companies and application counts
        var employerIds = users.Where(u => u.Role == UserRole.Employer).Select(u => u.Id).ToList();
        var companies = await context.Companies
            .Where(c => !c.IsDeleted && employerIds.Contains(c.EmployerUserId))
            .ToDictionaryAsync(c => c.EmployerUserId, c => new { c.Id, c.Name, c.IsVerified, c.LogoUrl }, cancellationToken);

        var seekerUserIds = users.Where(u => u.Role == UserRole.JobSeeker).Select(u => u.Id).ToList();
        var seekerProfiles = await context.JobSeekerProfiles
            .Where(p => !p.IsDeleted && seekerUserIds.Contains(p.UserId))
            .Include(p => p.Applications)
            .ToDictionaryAsync(p => p.UserId, p => p.Applications.Count(a => !a.IsDeleted), cancellationToken);

        var dtos = users.Select(u =>
        {
            var isLocked = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTimeOffset.UtcNow;
            companies.TryGetValue(u.Id, out var comp);
            seekerProfiles.TryGetValue(u.Id, out var appCount);

            return new AdminUserDto(
                u.Id,
                u.Email ?? string.Empty,
                u.FirstName,
                u.LastName,
                u.FullName,
                u.Role,
                isLocked,
                u.LockoutEnd?.UtcDateTime,
                comp?.Name,
                appCount,
                u.CreatedAtUtc,
                comp?.Id,
                comp?.IsVerified,
                comp?.LogoUrl
            );
        }).ToList();

        return Result<List<AdminUserDto>>.Success(dtos);
    }
}

public record ToggleUserLockoutCommand(Guid UserId) : IRequest<Result<AdminUserDto>>;

public class ToggleUserLockoutCommandHandler(
    UserManager<ApplicationUser> userManager,
    IApplicationDbContext context)
    : IRequestHandler<ToggleUserLockoutCommand, Result<AdminUserDto>>
{
    public async Task<Result<AdminUserDto>> Handle(ToggleUserLockoutCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null || user.IsDeleted)
        {
            return Result<AdminUserDto>.Failure("User not found.");
        }

        // Prevent locking the super admin
        if (user.Email?.Equals("admin@jobportal.com", StringComparison.OrdinalIgnoreCase) == true)
        {
            return Result<AdminUserDto>.Failure("Cannot lock the root administrator account.");
        }

        var isCurrentlyLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

        if (isCurrentlyLocked)
        {
            // Unlock
            await userManager.SetLockoutEndDateAsync(user, null);
        }
        else
        {
            // Lock for 30 days
            await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddDays(30));
        }

        // Retrieve fresh user state
        var isLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;
        var company = await context.Companies.FirstOrDefaultAsync(c => c.EmployerUserId == user.Id && !c.IsDeleted, cancellationToken);
        var seekerProfile = await context.JobSeekerProfiles.Include(p => p.Applications).FirstOrDefaultAsync(p => p.UserId == user.Id && !p.IsDeleted, cancellationToken);

        var dto = new AdminUserDto(
            user.Id,
            user.Email ?? string.Empty,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Role,
            isLocked,
            user.LockoutEnd?.UtcDateTime,
            company?.Name,
            seekerProfile?.Applications.Count(a => !a.IsDeleted) ?? 0,
            user.CreatedAtUtc,
            company?.Id,
            company?.IsVerified,
            company?.LogoUrl
        );

        return Result<AdminUserDto>.Success(dto);
    }
}

public record ToggleCompanyVerificationCommand(Guid CompanyId) : IRequest<Result<bool>>;

public class ToggleCompanyVerificationCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ToggleCompanyVerificationCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(ToggleCompanyVerificationCommand command, CancellationToken cancellationToken)
    {
        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.Id == command.CompanyId && !c.IsDeleted, cancellationToken);

        if (company is null)
        {
            return Result<bool>.Failure("Company not found.");
        }

        company.IsVerified = !company.IsVerified;
        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(company.IsVerified);
    }
}
