using Xunit;
using PAS.Server.Models;
using PAS.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace PAS.Tests
{
    public class IntegrationTests
    {
        [Fact]
        public async Task Database_ShouldSaveAndRetrieve_ProjectWithMembers()
        {
            // Arrange: Create a fresh InMemory Database for this specific test
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "Test_Integration_PAS_DB")
                .Options;

            // Phase 1: WRITE to the Database
            using (var context = new AppDbContext(options))
            {
                // 1. Create a Student User
                var student = new AppUser { FullName = "Test Student", Role = "Student", Email = "test@nsbm.ac.lk" };
                context.AppUsers.Add(student);
                await context.SaveChangesAsync();

                // 2. Create a Project
                var project = new Project { Title = "Cybersecurity Prototype", CreatedById = student.Id, Status = "Pending" };
                context.Projects.Add(project);
                await context.SaveChangesAsync();

                // 3. Link the Student to the Project (Team Member)
                var member = new ProjectMember { ProjectId = project.Id, UserId = student.Id, InviteStatus = "Accepted" };
                context.ProjectMembers.Add(member);
                await context.SaveChangesAsync();
            }

            // Phase 2: READ from the Database (Using a fresh context to simulate a real request)
            using (var context = new AppDbContext(options))
            {
                // Act: Fetch the project and "Include" the members table (SQL JOIN equivalent)
                var savedProject = await context.Projects
                    .Include(p => p.Members)
                    .FirstOrDefaultAsync(p => p.Title == "Cybersecurity Prototype");

                // Assert: Verify the data was saved and linked correctly
                Assert.NotNull(savedProject);
                Assert.Single(savedProject.Members); // Ensures exactly 1 member is attached
                Assert.Equal("Accepted", savedProject.Members.First().InviteStatus);
                
                // Verify the Foreign Key points to the correct user
                var linkedUser = await context.AppUsers.FindAsync(savedProject.Members.First().UserId);
                Assert.Equal("Test Student", linkedUser.FullName);
            }
        }
    }
}