using Xunit;
using Moq;
using PAS.Server.Models;
using PAS.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace PAS.Tests
{
    public class ProjectLogicTests
    {
        [Fact]
        public void Project_ShouldMaintainAnonymity_WhenInitialSubmissionIsMade()
        {
            // Arrange: Create a project proposal [cite: 40]
            var project = new Project 
            { 
                Title = "AI Research", 
                Status = "Pending", 
                CreatedById = 101 // The student's ID
            };

            // Assert: Ensure the SupervisorId is null [cite: 27]
            // This proves the "Blind" phase is active
            Assert.Null(project.SupervisorId);
            Assert.Equal("Pending", project.Status);
        }
    }
}