using Microsoft.AspNetCore.Mvc;
using PAS.Server.Data;
using PAS.Server.Models;
using PAS.Server.DTOs;
using System.Linq;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) { _context = context; }

        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _context.AppUsers.Select(u => new {
                u.Id, u.FullName, u.Email, u.Role, u.Faculty, u.Batch, 
                u.StudentId, u.IsBanned, u.DegreeType, u.DegreeProgram
            }).ToList();
            return Ok(users);
        }

        [HttpPut("update-user")]
        public IActionResult UpdateUser([FromBody] AppUser updatedData)
        {
            var user = _context.AppUsers.Find(updatedData.Id);
            if (user == null) return NotFound();
            if (user.Role == "Module Leader") return BadRequest("Module Leaders cannot be edited.");

            user.FullName = updatedData.FullName;
            user.Email = updatedData.Email;
            user.Batch = updatedData.Batch;
            user.StudentId = updatedData.StudentId;
            user.Faculty = updatedData.Faculty;
            
            _context.SaveChanges();
            return Ok(new { message = "User updated successfully." });
        }

        [HttpPost("change-role")]
        public IActionResult ChangeRole(int userId, string newRole)
        {
            var user = _context.AppUsers.Find(userId);
            if (user == null) return NotFound();
            // Prevent self-demotion or editing other MLs
            if (user.Role == "Module Leader") return BadRequest("Cannot change Module Leader roles.");

            user.Role = newRole;
            _context.SaveChanges();
            return Ok(new { message = $"User is now a {newRole}" });
        }

        [HttpPost("toggle-ban/{userId}")]
        public IActionResult ToggleBan(int userId)
        {
            var user = _context.AppUsers.Find(userId);
            if (user == null) return NotFound();
            if (user.Role == "Module Leader") return BadRequest("Module Leaders cannot be banned.");

            user.IsBanned = !user.IsBanned;
            _context.SaveChanges();
            return Ok(new { message = user.IsBanned ? "User Banned" : "User Unbanned" });
        }
    }
}