using JobPortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Job> Jobs { get; set; }
}