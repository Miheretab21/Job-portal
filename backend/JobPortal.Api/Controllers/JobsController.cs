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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
        {
            return NotFound();
        }

        return Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob(Job job)
    {
        job.PostedDate = DateTime.UtcNow;

        _context.Jobs.Add(job);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetJob),
            new { id = job.Id },
            job
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateJob(int id, Job updatedJob)
    {
        var existingJob = await _context.Jobs.FindAsync(id);

        if (existingJob == null)
        {
            return NotFound();
        }

        existingJob.Title = updatedJob.Title;
        existingJob.Company = updatedJob.Company;
        existingJob.Location = updatedJob.Location;
        existingJob.JobType = updatedJob.JobType;
        existingJob.Description = updatedJob.Description;
        existingJob.Salary = updatedJob.Salary;

        await _context.SaveChangesAsync();

        return Ok(existingJob);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
        {
            return NotFound();
        }

        _context.Jobs.Remove(job);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}