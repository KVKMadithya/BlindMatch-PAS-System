using System;
using System.Collections.Generic; // Added this!
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PAS.Server.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Faculty { get; set; } = string.Empty; // <-- ADDED THIS!

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; 

        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // <-- ADDED THIS LIST TO HOLD YOUR TEAM MEMBERS! -->
        public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

        // Relations
        public int CreatedById { get; set; }
        [ForeignKey("CreatedById")]
        public AppUser? CreatedBy { get; set; }

        public int? SupervisorId { get; set; }
        [ForeignKey("SupervisorId")]
        public AppUser? Supervisor { get; set; }

        // Add this inside the Project class
        public int? Marks { get; set; }

        // Add this under your other properties
        public string? GitHubRepoUrl { get; set; }

        // Add these to link the new tables
        public ICollection<GanttTask> Tasks { get; set; } = new List<GanttTask>();
        public ICollection<ProjectComment> Comments { get; set; } = new List<ProjectComment>();

        
    }
}