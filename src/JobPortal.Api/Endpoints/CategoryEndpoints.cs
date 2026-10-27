using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Categories.Queries;

namespace JobPortal.Api.Endpoints;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/categories")
            .WithTags("Categories");

        group.MapGet("/", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCategoriesQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(result.Error);
        })
        .WithName("GetCategories")
        .WithSummary("Retrieve all job categories with active job counts")
        .Produces<List<CategoryDto>>(StatusCodes.Status200OK);

        return app;
    }
}
