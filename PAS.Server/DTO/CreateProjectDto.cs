using System;
using System.Collections.Generic;

namespace PAS.Server.DTOs
{
    // A mini-DTO just for the incoming members
    public class TeamMemberDto
    {
        public string Name { get; set; } = string.Empty;
        public string StudentId { get; set; } = string.Empty;
    }

    public class CreateProjectDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Faculty { get; set; } = string.Empty;
        public DateTime? Deadline { get; set; }
        
        // We need to know WHO clicked the "Submit" button
        public int CreatedById { get; set; } 
        
        // The list of teammates from the React form
        public List<TeamMemberDto> Members { get; set; } = new List<TeamMemberDto>();
    }
}