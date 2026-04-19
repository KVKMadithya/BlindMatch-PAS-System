namespace PAS.Server.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int? SenderId { get; set; } // Nullable for system messages
        public int RecipientId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public bool IsSystemNotification { get; set; } = false;

        // Navigation Properties
        public AppUser? Sender { get; set; }
        public AppUser? Recipient { get; set; }
    }
}