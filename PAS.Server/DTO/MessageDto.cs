namespace PAS.Server.DTOs
{
    public class SendMessageDto
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}