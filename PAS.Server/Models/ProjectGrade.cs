using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PAS.Server.Models
{
    public class ProjectGrade
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        // Navigation property to link back to the specific Project
        [ForeignKey("ProjectId")]
        public Project? Project { get; set; } 

        [Required(ErrorMessage = "Marks are required.")]
        [Range(0, 100, ErrorMessage = "Marks must be a percentage between 0 and 100.")]
        [Column(TypeName = "decimal(18,2)")] // 🌟 This fixes the SQL truncation warning!
        public decimal Marks { get; set; }

        [MaxLength(2000, ErrorMessage = "Feedback cannot exceed 2000 characters.")]
        public string? Feedback { get; set; }

        [Required]
        public int GradedBy { get; set; }

        // Navigation property to link to the Module Leader who graded it
        [ForeignKey("GradedBy")]
        public AppUser? Assessor { get; set; } 

        public DateTime GradedAt { get; set; } = DateTime.UtcNow;
    }
}