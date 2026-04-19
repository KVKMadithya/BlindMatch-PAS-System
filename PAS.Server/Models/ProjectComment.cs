namespace PAS.Server.Models
{
    public class ProjectComment
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public AppUser? User { get; set; }
    }
}