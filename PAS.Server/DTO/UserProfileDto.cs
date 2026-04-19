namespace PAS.Server.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // "Student", "Supervisor", "Module Leader"
        public string? Bio { get; set; }
        public string? ProfilePicturePath { get; set; } // Just the relative filename
        public string? Faculty { get; set; }
        public string? Batch { get; set; }
        public string? FieldOfExpertise { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}