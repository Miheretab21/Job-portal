using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Queries;

public record GetEmployerCompanyQuery : IRequest<Result<EmployerCompanyProfileDto>>;

public class GetEmployerCompanyQueryHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<GetEmployerCompanyQuery, Result<EmployerCompanyProfileDto>>
{
    public async Task<Result<EmployerCompanyProfileDto>> Handle(GetEmployerCompanyQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<EmployerCompanyProfileDto>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value && !c.IsDeleted, cancellationToken);

        if (company is null)
        {
            return Result<EmployerCompanyProfileDto>.Failure("Company profile not found.");
        }

        var dto = new EmployerCompanyProfileDto(
            company.Id,
            company.Name,
            company.Description,
            company.Website,
            company.Location,
            company.Industry,
            company.CompanySize,
            company.IsVerified,
            company.LogoUrl
        );

        return Result<EmployerCompanyProfileDto>.Success(dto);
    }
}
