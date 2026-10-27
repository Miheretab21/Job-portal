using Microsoft.AspNetCore.Mvc;
using JobPortal.Application.Common.Messaging;
using JobPortal.Application.Features.Auth.Commands;
using JobPortal.Application.Features.Auth.DTOs;
using JobPortal.Application.Features.Auth.Queries;

namespace JobPortal.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Authentication");

        group.MapPost("/register", async (
            [FromBody] RegisterCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { errors = result.Errors });
        })
        .WithName("Register")
        .WithSummary("Register a new Job Seeker or Employer account")
        .Produces<AuthResponseDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/login", async (
            [FromBody] LoginCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { errors = result.Errors });
        })
        .WithName("Login")
        .WithSummary("Authenticate with email and password to receive JWT and refresh tokens")
        .Produces<AuthResponseDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/refresh", async (
            [FromBody] RefreshTokenCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { errors = result.Errors });
        })
        .WithName("RefreshToken")
        .WithSummary("Rotate refresh token and obtain a new JWT access token")
        .Produces<AuthResponseDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/me", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(new GetCurrentUserQuery(), ct);
            return result.IsSuccess ? Results.Ok(result.Value) : Results.Unauthorized();
        })
        .RequireAuthorization()
        .WithName("GetCurrentUser")
        .WithSummary("Get authenticated user profile details")
        .Produces<UserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }
}
