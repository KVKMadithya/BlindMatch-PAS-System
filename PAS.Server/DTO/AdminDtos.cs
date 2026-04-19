namespace PAS.Server.DTOs
{
    public class UserListDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Faculty { get; set; }
    }

    public class MarkProjectDto
    {
        public int ProjectId { get; set; }
        public int Marks { get; set; }
    }
}