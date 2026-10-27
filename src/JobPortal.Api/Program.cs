using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;
using JobPortal.Api.Endpoints;
using JobPortal.Api.Handlers;
using JobPortal.Api.Middleware;
using JobPortal.Application;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure;
using JobPortal.Infrastructure.Notifications;
using JobPortal.Infrastructure.Persistence;

// 1. Configure Serilog early
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting JobPortal API (.NET 10 LTS)...");

    var builder = WebApplication.CreateBuilder(args);

    // Serilog
    builder.Host.UseSerilog();

    // 2. Register Application & Infrastructure Clean Architecture layers
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // 3. Exception handling & ProblemDetails (RFC 7807)
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    // 4. OpenAPI & Scalar documentation
    builder.Services.AddOpenApi();

    // 5. CORS for Angular 22 Frontend
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AngularApp", policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    var app = builder.Build();

    // 6. Database Migration & Seeding on Startup
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var dbContext = services.GetRequiredService<ApplicationDbContext>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            Log.Information("Applying EF Core migrations to PostgreSQL 18...");
            await dbContext.Database.MigrateAsync();

            Log.Information("Seeding database initial roles, admin, categories, and sample jobs...");
            await DatabaseSeeder.SeedAsync(dbContext, userManager, roleManager);
            Log.Information("Database setup & seed completed successfully.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred while migrating or seeding the database.");
            throw;
        }
    }

    // 7. Request pipeline configuration
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();

    app.UseCors("AngularApp");
    app.UseStaticFiles();

    app.UseAuthentication();
    app.UseAuthorization();

    // 8. Scalar & OpenAPI endpoints
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("JobPortal API Documentation")
               .WithTheme(ScalarTheme.Moon);
    });

    // 9. Health check endpoint
    app.MapGet("/health", async (ApplicationDbContext db) =>
    {
        var canConnect = await db.Database.CanConnectAsync();
        return canConnect
            ? Results.Ok(new { status = "Healthy", database = "PostgreSQL 18 Connected", timestamp = DateTime.UtcNow })
            : Results.Problem("Cannot connect to PostgreSQL database", statusCode: 503);
    })
    .WithTags("Health")
    .WithName("HealthCheck");

    // 10. Map Feature Endpoints
    app.MapAuthEndpoints();
    app.MapCategoryEndpoints();
    app.MapJobEndpoints();
    app.MapApplicationEndpoints();
    app.MapEmployerEndpoints();
    app.MapFileEndpoints();
    app.MapAdminEndpoints();

    // 11. SignalR Real-Time Notification Hub
    app.MapHub<NotificationHub>("/hubs/notifications");

    Log.Information("JobPortal API running! Scalar docs available at: /scalar/v1");
    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "JobPortal host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
