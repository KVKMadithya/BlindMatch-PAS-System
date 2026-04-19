using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PAS.Server.Data;
using PAS.Server.Models;
using System.Linq;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkspaceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkspaceController(AppDbContext context) { _context = context; }

        // 1. GET ACCESSIBLE PROJECTS (For the Dropdown)
        // 1. GET ACCESSIBLE PROJECTS (For the Dropdown)
        [HttpGet("my-projects/{userId}")]
        public IActionResult GetMyProjects(int userId)
        {
            // Gets projects where the user is the creator, the assigned supervisor, 
            // OR an invited team member who has explicitly "Accepted"
            var projects = _context.Projects
                .Where(p => 
                    p.CreatedById == userId || 
                    p.SupervisorId == userId || 
                    p.Members.Any(m => m.UserId == userId && m.InviteStatus == "Accepted")
                )
                .Select(p => new { p.Id, p.Title })
                .Distinct() // Ensures no duplicate entries if they are both creator and member
                .ToList();

            return Ok(projects);
        }

        // 2. GET WORKSPACE DATA (Tasks, Comments, GitHub)
        [HttpGet("{projectId}")]
        public IActionResult GetWorkspaceData(int projectId)
        {
            var project = _context.Projects
                .Include(p => p.Tasks)
                .Include(p => p.Comments).ThenInclude(c => c.User)
                .FirstOrDefault(p => p.Id == projectId);

            if (project == null) return NotFound();

            return Ok(new
            {
                //githubRepoUrl = project.GitHubRepoUrl,
                tasks = project.Tasks.OrderBy(t => t.StartDate).ToList(),
                
                // 🌟 THE FIX: Safely checking if c.User is null before grabbing the Name and Role
                comments = project.Comments.OrderBy(c => c.CreatedAt).Select(c => new {
                    c.Id, 
                    c.Message, 
                    c.CreatedAt, 
                    SenderName = c.User != null ? c.User.FullName : "Unknown User", 
                    SenderRole = c.User != null ? c.User.Role : "Unknown", 
                    SenderPhoto = c.User != null ? c.User.ProfilePicturePath : null
                }).ToList()
            });
        }

        // 3. ADD GANTT TASK
        [HttpPost("task")]
        public IActionResult AddTask([FromBody] GanttTask task)
        {
            _context.GanttTasks.Add(task);
            _context.SaveChanges();
            return Ok();
        }

        // 4. ADD COMMENT
        [HttpPost("comment")]
        public IActionResult AddComment([FromBody] ProjectComment comment)
        {
            _context.ProjectComments.Add(comment);
            _context.SaveChanges();
            return Ok();
        }

        // 5. UPDATE GITHUB URL
        [HttpPut("github/{projectId}")]
        public IActionResult UpdateGithub(int projectId, [FromBody] string url)
        {
            var project = _context.Projects.Find(projectId);
            if (project != null)
            {
                //project.GitHubRepoUrl = url;
                _context.SaveChanges();
            }
            return Ok();
        }
    }
}