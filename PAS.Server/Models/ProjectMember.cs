using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PAS.Server.Models
{
    public class ProjectMember
    {
        [Key]
        public int Id { get; set; }

        public int ProjectId { get; set; }

        // 🌟 THE MISSING PROPERTIES THE CONTROLLER WAS LOOKING FOR 🌟
        public int? UserId { get; set; } 
        public string InviteStatus { get; set; } = "Pending";

        // We can keep these optional just in case old data still relies on them
        public string? Name { get; set; }
        public string? StudentId { get; set; }

        // Navigation properties
        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
    }
}