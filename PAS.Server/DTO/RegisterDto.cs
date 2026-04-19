namespace PAS.Server.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
        public string Batch { get; set; } = string.Empty;
        public string Faculty { get; set; } = string.Empty;
        public string DegreeType { get; set; } = string.Empty;
        public string DegreeProgram { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}