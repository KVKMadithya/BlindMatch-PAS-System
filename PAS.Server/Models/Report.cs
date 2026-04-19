namespace PAS.Server.Models
{
    public class Report
    {
        public int Id { get; set; }
        public int ReporterId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public string? AdminResponse { get; set; } 
        public DateTime? RespondedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsResolved { get; set; } = false;

        // Navigation property
        public AppUser? Reporter { get; set; }
    }
}