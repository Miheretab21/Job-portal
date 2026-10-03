using JobPortal.Api.Data;
using JobPortal.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _context;

    public JobsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var jobs = await _context.Jobs.ToListAsync();

        return Ok(jobs);
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob(Job job)
    {
        job.PostedDate = DateTime.UtcNow;

        _context.Jobs.Add(job);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetJobs),
            new { id = job.Id },
            job
        );
    }
}