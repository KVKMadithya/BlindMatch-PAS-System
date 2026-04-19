using System;
using System.ComponentModel.DataAnnotations;

namespace PAS.Server.Models
{
    public class AppUser
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Full Name is required.")]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Name can only contain letters and spaces.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress]
        [MaxLength(150)]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // ---------------------------------------------------
        // STUDENT FIELDS (Nullable because Supervisors don't need them)
        // ---------------------------------------------------
        
        [MaxLength(50)]
        public string? StudentId { get; set; } 

        [MaxLength(20)]
        public string? Batch { get; set; }

        [MaxLength(100)]
        public string? Faculty { get; set; }

        [MaxLength(10)]
        public string? DegreeType { get; set; } // PLY, UGC, VU

        [MaxLength(150)]
        public string? DegreeProgram { get; set; }

        // ---------------------------------------------------
        // SUPERVISOR ONLY FIELDS
        // ---------------------------------------------------
        
        [MaxLength(300)]
        public string? ResearchTags { get; set; } 
        
        public string? FieldOfExpertise { get; set; }

        // ---------------------------------------------------
        // 🌟 NEW PROFILE COLUMNS ADDED TO DATABASE 🌟
        // ---------------------------------------------------
        
        public string? Bio { get; set; }
        
        [MaxLength(500)]
        public string? ProfilePicturePath { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsBanned { get; set; } = false;

        public string? ExpertiseDetails { get; set; }
        public string? ExpertiseCategories { get; set; }
    }
}