using Shouldly;
using Xunit;
using JobPortal.Application.Features.Auth.Commands;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.UnitTests.Features.Auth;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Email_Is_Empty()
    {
        var command = new RegisterCommand("", "Password123!", "John", "Doe", UserRole.JobSeeker, null);
        var result = _validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(RegisterCommand.Email));
    }

    [Fact]
    public void Should_Have_Error_When_Password_Is_Too_Short()
    {
        var command = new RegisterCommand("john@example.com", "123", "John", "Doe", UserRole.JobSeeker, null);
        var result = _validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(RegisterCommand.Password));
    }

    [Fact]
    public void Should_Require_CompanyName_When_Role_Is_Employer()
    {
        var command = new RegisterCommand("employer@example.com", "Password123!", "Jane", "Smith", UserRole.Employer, null);
        var result = _validator.Validate(command);
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(RegisterCommand.CompanyName));
    }

    [Fact]
    public void Should_Be_Valid_When_All_Fields_Are_Correct()
    {
        var command = new RegisterCommand("seeker@example.com", "Password123!", "John", "Doe", UserRole.JobSeeker, null);
        var result = _validator.Validate(command);
        result.IsValid.ShouldBeTrue();
    }
}
