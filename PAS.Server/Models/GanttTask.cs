namespace PAS.Server.Models
{
    public class GanttTask
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string TaskName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Progress { get; set; } = 0;
    }
}