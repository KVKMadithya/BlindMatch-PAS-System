namespace PAS.Server.DTOs
{
    public class UpdateProfileDto
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        // For simplicity, we only allow updating bio for now. We can add Faculty/Batch later.
    }
}