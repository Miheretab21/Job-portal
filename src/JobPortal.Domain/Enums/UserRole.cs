namespace JobPortal.Domain.Enums;

public enum UserRole
{
    JobSeeker = 1,
    Employer = 2,
    Admin = 3
}

public static class Roles
{
    public const string JobSeeker = "JobSeeker";
    public const string Employer = "Employer";
    public const string Admin = "Admin";

    public static readonly IReadOnlyList<string> All = [JobSeeker, Employer, Admin];
}
