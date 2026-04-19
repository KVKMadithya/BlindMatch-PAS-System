using Microsoft.EntityFrameworkCore;
using PAS.Server.Models;

namespace PAS.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ProjectProposal> ProjectProposals { get; set; }
        public DbSet<AppUser> AppUsers { get; set; } 

        public DbSet<Project> Projects { get; set; }

        public DbSet<ProjectMember> ProjectMembers { get; set; }

        public DbSet<Report> Reports { get; set; }

        public DbSet<Message> Messages { get; set; }

        public DbSet<GanttTask> GanttTasks { get; set; }

        public DbSet<ProjectComment> ProjectComments { get; set; }

        public DbSet<ProjectGrade> ProjectGrades { get; set; }
    }
}