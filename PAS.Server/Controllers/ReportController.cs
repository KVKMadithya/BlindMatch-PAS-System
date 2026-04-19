using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PAS.Server.Data;
using PAS.Server.Models;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        // 📤 STUDENT/SUPERVISOR SIDE: Send a new report
        [HttpPost("send")]
        public IActionResult SendReport([FromBody] Report report)
        {
            if (report == null) return BadRequest();

            _context.Reports.Add(report);
            _context.SaveChanges();
            return Ok(new { message = "Report submitted to Module Leader." });
        }

        // 📥 MODULE LEADER SIDE: Get all reports with detailed sender info
        [HttpGet("all")]
        public IActionResult GetReports()
        {
            var reports = _context.Reports
                .Include(r => r.Reporter)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Subject,
                    r.Message,
                    r.CreatedAt,
                    r.IsResolved,
                    r.AdminResponse,   // New column from SQL
                    r.RespondedAt,     // New column from SQL
                    SenderName = r.Reporter != null ? r.Reporter.FullName : "Unknown",
                    SenderRole = r.Reporter != null ? r.Reporter.Role : "Unknown",
                    SenderPhoto = r.Reporter != null ? r.Reporter.ProfilePicturePath : null
                }).ToList();

            return Ok(reports);
        }

        // ✍️ MODULE LEADER SIDE: Respond and Resolve a report
        [HttpPut("respond/{id}")]
        public IActionResult RespondToReport(int id, [FromBody] string response)
        {
            var report = _context.Reports.Find(id);
            if (report == null) return NotFound(new { message = "Report not found." });

            // Update the record with the ML's feedback
            report.AdminResponse = response;
            report.IsResolved = true;
            report.RespondedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return Ok(new { message = "Response sent and report resolved." });
        }
    }
}