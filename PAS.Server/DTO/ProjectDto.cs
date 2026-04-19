namespace PAS.Server.DTOs
{
    public class CreateProjectWithInvitesDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Faculty { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int CreatedById { get; set; }
        
        // The array of invited student IDs sent from React!
        public List<int> InvitedMemberIds { get; set; } = new List<int>(); 
    }
}