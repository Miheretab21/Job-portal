namespace JobPortal.Application.Features.Jobs.DTOs;

public record JobFacetsDto(
    List<FacetItemDto> Skills,
    List<FacetItemDto> Categories,
    List<FacetItemDto> ExperienceLevels,
    List<FacetItemDto> JobTypes,
    decimal MinSalary,
    decimal MaxSalary,
    int TotalJobs,
    int RemoteJobsCount
);

public record FacetItemDto(
    string Key,
    string Label,
    int Count,
    string? Extra = null
);
