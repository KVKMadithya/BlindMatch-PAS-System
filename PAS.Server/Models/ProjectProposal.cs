using System.ComponentModel.DataAnnotations;

namespace PAS.Server.Models
{
    public class ProjectProposal
    {
        [Key] // This becomes the Primary Key (PK) in your relational schema
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Abstract { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string TechStack { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ResearchArea { get; set; } = string.Empty;

        // The "Blind" logic hinge: 
        // This links to the student, but we will hide it from the Supervisor View
        [Required]
        public string StudentId { get; set; } = string.Empty;

        // Status: "Pending", "Under Review", or "Matched"
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; 
    }
}