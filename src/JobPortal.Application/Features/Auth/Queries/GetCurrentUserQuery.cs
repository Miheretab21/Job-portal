using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Exceptions;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Auth.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Features.Auth.Queries;

public record GetCurrentUserQuery : IRequest<Result<UserDto>>;

public class GetCurrentUserQueryHandler(
    ICurrentUserService currentUserService,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
{
    public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        if (currentUserService.UserId == null)
        {
            return Result<UserDto>.Failure("User is not authenticated.");
        }

        var user = await userManager.Users
            .Include(u => u.Company)
            .Include(u => u.SeekerProfile)
            .FirstOrDefaultAsync(u => u.Id == currentUserService.UserId.Value, cancellationToken);

        if (user == null)
        {
            return Result<UserDto>.Failure("User was not found.");
        }

        var dto = new UserDto(
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

        return Result<UserDto>.Success(dto);
    }
}
