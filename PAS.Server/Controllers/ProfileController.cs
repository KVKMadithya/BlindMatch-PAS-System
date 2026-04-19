using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using PAS.Server.Data;
using PAS.Server.DTOs;
using PAS.Server.Models;
using System;
using System.IO;
using System.Linq;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment; // For finding the wwwroot folder

        public ProfileController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // ---------------------------------------------------
        // 1. GET FULL PROFILE
        // ---------------------------------------------------
        [HttpGet("{userId}")]
        public IActionResult GetProfile(int userId)
        {
            var user = _context.AppUsers.Find(userId);
            if (user == null) return NotFound();

            // Using an anonymous object so we don't have to manually update the UserProfileDto file!
            // It grabs all the new Database columns (Expertise) perfectly.
            return Ok(new 
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                bio = user.Bio,
                profilePicturePath = user.ProfilePicturePath,
                faculty = user.Faculty,
                batch = user.Batch,
                expertiseDetails = user.ExpertiseDetails,       // 🌟 New!
                expertiseCategories = user.ExpertiseCategories, // 🌟 New!
                createdAt = user.CreatedAt
            });
        }

        // ---------------------------------------------------
        // 2. UPDATE BIO ONLY
        // ---------------------------------------------------
        [HttpPost("update-bio")]
        public IActionResult UpdateBio([FromBody] UpdateProfileDto dto)
        {
            var user = _context.AppUsers.Find(dto.UserId);
            if (user == null) return NotFound();

            user.Bio = dto.Bio;
            _context.SaveChanges();

            return Ok(new { message = "Bio updated successfully!" });
        }

        // ---------------------------------------------------
        // 3. UPLOAD PROFILE PICTURE
        // ---------------------------------------------------
        [HttpPost("upload-photo/{userId}")]
        public IActionResult UploadPhoto(int userId, IFormFile file) 
        {
            var user = _context.AppUsers.Find(userId);
            if (user == null) return NotFound();
            if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

            // 1. Safely find or define the wwwroot path
            string webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            
            // 2. Define the exact folder for profiles
            string uploadFolder = Path.Combine(webRootPath, "images", "profiles");
            
            // 3. Create the directories if they don't exist yet!
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            // Create a unique filename (e.g., profile_123_4567.jpg)
            string uniqueFileName = $"profile_{user.Id}_{Guid.NewGuid().ToString().Substring(0, 5)}{Path.GetExtension(file.FileName)}";
            string filePath = Path.Combine(uploadFolder, uniqueFileName);

            // Physically save the binary file to the server disk!
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            // Lock the new filename in the SQL database
            user.ProfilePicturePath = uniqueFileName;
            _context.SaveChanges();

            return Ok(new { message = "Photo uploaded successfully!", filename = uniqueFileName });
        }

        // ---------------------------------------------------
        // 4. UPDATE EXPERTISE (NEW!)
        // ---------------------------------------------------
        [HttpPost("update-expertise")]
        public IActionResult UpdateExpertise([FromBody] UpdateExpertiseDto dto)
        {
            var user = _context.AppUsers.Find(dto.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            // Save the exact preferences and comma-separated tags to the database
            user.ExpertiseDetails = dto.Details;
            user.ExpertiseCategories = dto.Categories;

            _context.SaveChanges();

            return Ok(new { message = "Expertise profile updated successfully." });
        }
    }

    // 🌟 DTO placed right here so you don't have to create a new file
    public class UpdateExpertiseDto
    {
        public int UserId { get; set; }
        public string Details { get; set; } = string.Empty;
        public string Categories { get; set; } = string.Empty;
    }
}