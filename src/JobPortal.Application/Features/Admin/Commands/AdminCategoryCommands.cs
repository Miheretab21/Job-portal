using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Admin.DTOs;
using JobPortal.Domain.Common;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Features.Admin.Commands;

public record CreateCategoryCommand(
    string Name,
    string Slug,
    string? Description,
    string? Icon
) : IRequest<Result<TopCategoryMetricDto>>;

public class CreateCategoryCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<CreateCategoryCommand, Result<TopCategoryMetricDto>>
{
    public async Task<Result<TopCategoryMetricDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await context.JobCategories.AnyAsync(c => c.Slug == slug, cancellationToken);
        if (exists)
        {
            return Result<TopCategoryMetricDto>.Failure($"Category with slug '{slug}' already exists.");
        }

        var category = new JobCategory
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            Icon = request.Icon?.Trim(),
            CreatedAtUtc = dateTimeProvider.UtcNow
        };

        context.JobCategories.Add(category);
        await context.SaveChangesAsync(cancellationToken);

        var dto = new TopCategoryMetricDto(
            category.Id,
            category.Name,
            category.Slug,
            category.Icon,
            0
        );

        return Result<TopCategoryMetricDto>.Success(dto);
    }
}

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon
) : IRequest<Result<TopCategoryMetricDto>>;

public class UpdateCategoryCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider)
    : IRequestHandler<UpdateCategoryCommand, Result<TopCategoryMetricDto>>
{
    public async Task<Result<TopCategoryMetricDto>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.JobCategories
            .Include(c => c.Jobs)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            return Result<TopCategoryMetricDto>.Failure("Category not found.");
        }

        var slug = request.Slug.Trim().ToLowerInvariant();
        var slugConflict = await context.JobCategories.AnyAsync(c => c.Slug == slug && c.Id != request.Id, cancellationToken);
        if (slugConflict)
        {
            return Result<TopCategoryMetricDto>.Failure($"Another category with slug '{slug}' already exists.");
        }

        category.Name = request.Name.Trim();
        category.Slug = slug;
        category.Description = request.Description?.Trim();
        category.Icon = request.Icon?.Trim();
        category.UpdatedAtUtc = dateTimeProvider.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        var activeCount = category.Jobs.Count(j => !j.IsDeleted && (int)j.Status == 2);
        var dto = new TopCategoryMetricDto(
            category.Id,
            category.Name,
            category.Slug,
            category.Icon,
            activeCount
        );

        return Result<TopCategoryMetricDto>.Success(dto);
    }
}

public record DeleteCategoryCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteCategoryCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteCategoryCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.JobCategories
            .Include(c => c.Jobs)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            return Result<bool>.Failure("Category not found.");
        }

        var hasJobs = category.Jobs.Any(j => !j.IsDeleted);
        if (hasJobs)
        {
            return Result<bool>.Failure("Cannot delete category because active or existing job requisitions are assigned to it.");
        }

        context.JobCategories.Remove(category);
        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
