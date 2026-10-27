using Shouldly;
using Xunit;
using JobPortal.Application.Features.Jobs.DTOs;
using JobPortal.Application.Features.Jobs.Queries;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.UnitTests.Features.Jobs;

public class JobQueryTests
{
    [Fact]
    public void GetJobsQuery_Should_Have_Default_Pagination()
    {
        var query = new GetJobsQuery();

        query.PageNumber.ShouldBe(1);
        query.PageSize.ShouldBe(10);
        query.Search.ShouldBeNull();
        query.SortBy.ShouldBeNull();
    }

    [Fact]
    public void GetJobsQuery_Should_Support_Custom_Filters()
    {
        var query = new GetJobsQuery
        {
            Search = ".NET 10",
            MinSalary = 150000m,
            MaxSalary = 200000m,
            IsRemote = true,
            ExperienceLevels = "3,4",
            Skills = "Kubernetes,.NET 10",
            SortBy = "salary_desc"
        };

        query.Search.ShouldBe(".NET 10");
        query.MinSalary.ShouldBe(150000m);
        query.MaxSalary.ShouldBe(200000m);
        query.IsRemote.ShouldBe(true);
        query.ExperienceLevels.ShouldBe("3,4");
        query.Skills.ShouldBe("Kubernetes,.NET 10");
        query.SortBy.ShouldBe("salary_desc");
    }

    [Fact]
    public void JobFacetsDto_Should_Store_Metrics_Correctly()
    {
        var skills = new List<FacetItemDto> { new(".NET 10", ".NET 10", 4) };
        var categories = new List<FacetItemDto> { new("software", "Software", 3) };
        var levels = new List<FacetItemDto> { new("3", "Senior Level", 2) };
        var types = new List<FacetItemDto> { new("1", "Full-time", 5) };

        var facets = new JobFacetsDto(
            skills,
            categories,
            levels,
            types,
            MinSalary: 75000m,
            MaxSalary: 250000m,
            TotalJobs: 5,
            RemoteJobsCount: 4
        );

        facets.TotalJobs.ShouldBe(5);
        facets.RemoteJobsCount.ShouldBe(4);
        facets.MinSalary.ShouldBe(75000m);
        facets.MaxSalary.ShouldBe(250000m);
        facets.Skills.Count.ShouldBe(1);
        facets.Skills[0].Count.ShouldBe(4);
    }
}
