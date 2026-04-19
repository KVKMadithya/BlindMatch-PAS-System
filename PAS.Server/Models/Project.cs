using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PAS.Server.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Project Title is required.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 200 characters.")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-_:\.]+$", ErrorMessage = "Title contains invalid special characters.")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Project Description is required.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Faculty { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; 

        public DateTime? Deadline { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ---------------------------------------------------
        // RELATIONS & TEAM MEMBERS
        // ---------------------------------------------------
        
        public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

        public int CreatedById { get; set; }
        [ForeignKey("CreatedById")]
        public AppUser? CreatedBy { get; set; }

        public int? SupervisorId { get; set; }
        [ForeignKey("SupervisorId")]
        public AppUser? Supervisor { get; set; }

        // ---------------------------------------------------
        // GRADING & EXTERNAL LINKS
        // ---------------------------------------------------
        
        public int? Marks { get; set; }

        [Url(ErrorMessage = "Must be a valid URL format.")]
        [MaxLength(500)]
        //public string? GitHubRepoUrl { get; set; }

        // ---------------------------------------------------
        // WORKSPACE MODULES
        // ---------------------------------------------------
        
        public ICollection<GanttTask> Tasks { get; set; } = new List<GanttTask>();
        public ICollection<ProjectComment> Comments { get; set; } = new List<ProjectComment>();
    }
}