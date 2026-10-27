using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Employer.DTOs;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Employer.Commands;

public record UpdateEmployerCompanyCommand(UpdateCompanyProfileRequest Request) : IRequest<Result<EmployerCompanyProfileDto>>;

public class UpdateEmployerCompanyCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdateEmployerCompanyCommand, Result<EmployerCompanyProfileDto>>
{
    public async Task<Result<EmployerCompanyProfileDto>> Handle(UpdateEmployerCompanyCommand command, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (userId is null)
        {
            return Result<EmployerCompanyProfileDto>.Failure("Unauthorized.");
        }

        var company = await context.Companies
            .FirstOrDefaultAsync(c => c.EmployerUserId == userId.Value && !c.IsDeleted, cancellationToken);

        if (company is null)
        {
            return Result<EmployerCompanyProfileDto>.Failure("Company profile not found.");
        }

        var req = command.Request;

        if (!string.IsNullOrWhiteSpace(req.Name))
        {
            company.Name = req.Name.Trim();
        }
        if (req.Description != null)
        {
            company.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        }
        if (req.Website != null)
        {
            company.Website = string.IsNullOrWhiteSpace(req.Website) ? null : req.Website.Trim();
        }
        if (req.Location != null)
        {
            company.Location = string.IsNullOrWhiteSpace(req.Location) ? null : req.Location.Trim();
        }
        if (req.Industry != null)
        {
            company.Industry = string.IsNullOrWhiteSpace(req.Industry) ? null : req.Industry.Trim();
        }
        if (req.CompanySize != null)
        {
            company.CompanySize = string.IsNullOrWhiteSpace(req.CompanySize) ? null : req.CompanySize.Trim();
        }
        if (req.LogoUrl != null)
        {
            company.LogoUrl = string.IsNullOrWhiteSpace(req.LogoUrl) ? null : req.LogoUrl.Trim();
        }

        await context.SaveChangesAsync(cancellationToken);

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
