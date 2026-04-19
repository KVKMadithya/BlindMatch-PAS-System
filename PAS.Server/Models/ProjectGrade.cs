namespace PAS.Server.Models
{
    public class ProjectGrade
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public decimal Marks { get; set; }
        public string? Feedback { get; set; }
        public int GradedBy { get; set; }
        public DateTime GradedAt { get; set; } = DateTime.UtcNow;
    }
}