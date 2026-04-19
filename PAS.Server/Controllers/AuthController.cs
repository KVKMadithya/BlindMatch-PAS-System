using Microsoft.AspNetCore.Mvc;
using PAS.Server.Data;
using PAS.Server.Models;
using PAS.Server.DTOs;
using System.Linq;

namespace PAS.Server.Controllers
{
    // This tells React the address is: http://localhost:XXXX/api/auth
    [Route("api/[controller]")] 
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Bring in the database blueprint
        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------
        // 1. THE REGISTER ENDPOINT
        // ---------------------------------------------------
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            // Check if email is already in the database
            if (_context.AppUsers.Any(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email is already in use!" });
            }

            // Create the secure User object
            var user = new AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                StudentId = dto.StudentId,
                Batch = dto.Batch,
                Faculty = dto.Faculty,
                DegreeType = dto.DegreeType,
                DegreeProgram = dto.DegreeProgram,
                
                // SECURITY ENFORCEMENT: Force default role, hash the password
                Role = "Student", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) 
            };

            // Save to SQL Server
            _context.AppUsers.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "Account created successfully!" });
        }

        // ---------------------------------------------------
        // 2. THE LOGIN ENDPOINT
        // ---------------------------------------------------
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            // 1. Find the user in the database by their email
            var user = _context.AppUsers.SingleOrDefault(u => u.Email == dto.Email);

            // 2. If the user doesn't exist, reject them
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // 3. Check if the password they typed matches the hashed password in the vault
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // 4. Success!
            return Ok(new { 
                message = "Login successful!",
                userId = user.Id,
                role = user.Role,
                fullName = user.FullName 
            });
        }
    }
}