using Microsoft.EntityFrameworkCore;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Application.Common.Messaging;
using JobPortal.Domain.Common;

namespace JobPortal.Application.Features.Categories.Queries;

public record CategoryDto(Guid Id, string Name, string Slug, string? Description, string? Icon, int JobsCount);

public record GetCategoriesQuery : IRequest<Result<List<CategoryDto>>>;

public class GetCategoriesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetCategoriesQuery, Result<List<CategoryDto>>>
{
    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await context.JobCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.Icon,
                c.Jobs.Count(j => !j.IsDeleted && (int)j.Status == 2)
            ))
            .ToListAsync(cancellationToken);

        return Result<List<CategoryDto>>.Success(categories);
    }
}
