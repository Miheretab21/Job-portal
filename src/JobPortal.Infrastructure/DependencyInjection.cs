using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using JobPortal.Application.Common.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Identity;
using JobPortal.Infrastructure.Persistence;
using JobPortal.Infrastructure.Persistence.Interceptors;
using JobPortal.Infrastructure.Services;
using JobPortal.Infrastructure.Notifications;

namespace JobPortal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Services & Interceptors
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<AuditableEntityInterceptor>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IAiResumeScoringService, AiResumeScoringService>();

        // 2. DbContext with PostgreSQL
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString) || connectionString.Contains("YOUR_POSTGRES_PASSWORD"))
        {
            throw new InvalidOperationException(
                "CRITICAL DATABASE CONFIGURATION ERROR: The database connection string has not been configured or is still set to a placeholder! " +
                "Configure DefaultConnection via .NET User Secrets (dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"<conn-str>\") " +
                "or via the ConnectionStrings__DefaultConnection environment variable.");
        }

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
            options.UseNpgsql(connectionString)
                   .AddInterceptors(interceptor);
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // 3. Identity Core
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
            options.User.RequireUniqueEmail = true;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // 4. JWT Authentication
        var jwtSettings = new JwtSettings();
        configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

        // Security Validation Guard: Prevent running with missing, short, or placeholder signing keys
        if (string.IsNullOrWhiteSpace(jwtSettings.Secret) ||
            jwtSettings.Secret.Contains("YOUR_32_CHARACTER_JWT_SECRET_KEY") ||
            jwtSettings.Secret.StartsWith("YOUR_") ||
            jwtSettings.Secret.Length < 32)
        {
            throw new InvalidOperationException(
                "CRITICAL SECURITY CONFIGURATION ERROR: The JWT Secret has not been configured or is still set to an insecure placeholder! " +
                "Configure a secure cryptographic key (at least 32 characters / 256 bits) via .NET User Secrets (dotnet user-secrets set \"JwtSettings:Secret\" \"<key>\") " +
                "or via the JWT_SECRET / JwtSettings__Secret environment variable.");
        }

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddSignalR();
        services.AddScoped<INotificationService, SignalRNotificationService>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorizationBuilder()
            .AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"))
            .AddPolicy("RequireEmployerRole", policy => policy.RequireRole("Employer", "Admin"))
            .AddPolicy("RequireSeekerRole", policy => policy.RequireRole("JobSeeker", "Admin"));

        return services;
    }
}
