using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PAS.Server.Data;
using PAS.Server.Models;
using PAS.Server.DTOs;
using System.Linq;
using System;
using System.Collections.Generic;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------
        // 1. CREATE PROJECT & DISPATCH INVITATIONS
        // ---------------------------------------------------
        [HttpPost("create-with-invites")]
        public IActionResult CreateProjectWithInvites([FromBody] CreateProjectWithInvitesDto dto)
        {
            // 1. Create the Project in "Draft" state (Waiting for team to accept)
            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                Faculty = dto.Faculty,
                Deadline = dto.Deadline,
                CreatedById = dto.CreatedById,
                Status = "Draft" // 🌟 Draft, not Pending yet!
            };

            _context.Projects.Add(project);
            _context.SaveChanges(); // Save to generate the Project.Id

            // 2. Add the Project Creator as an "Accepted" Member automatically
            var creatorMember = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = dto.CreatedById,
                InviteStatus = "Accepted"
            };
            _context.ProjectMembers.Add(creatorMember);

            // 3. Loop through all the invited students from React
            foreach (var userId in dto.InvitedMemberIds)
            {
                // Add them to the team roster as "Pending"
                var pendingMember = new ProjectMember
                {
                    ProjectId = project.Id,
                    UserId = userId,
                    InviteStatus = "Pending"
                };
                _context.ProjectMembers.Add(pendingMember);

                // 🌟 4. SEND THE AUTOMATED MAILBOX INVITE 🌟
                var inviteEmail = new Message
                {
                    SenderId = null, // System Bot
                    RecipientId = userId,
                    Subject = $"Team Invitation: {project.Title}",
                    Body = $"Hello! You have been invited to join the research team for '{project.Title}'. " +
                           $"Please review the project details and coordinate with the Project Leader. " +
                           $"\n\nSystem Note: Log into your dashboard to Accept or Reject this invitation.",
                    IsSystemNotification = true,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Messages.Add(inviteEmail);
            }

            // 5. Save all members and emails to the database in one sweep
            _context.SaveChanges();

            return Ok(new { message = "Draft created and invitations successfully dispatched!" });
        }

        // ---------------------------------------------------
        // 2. GET ALL PROJECTS (Anonymous Feed)
        // ---------------------------------------------------
        [HttpGet("all")]
        public IActionResult GetAllProjects()
        {
            var projects = _context.Projects
                .Where(p => p.SupervisorId == null && p.Status != "Draft") // Hide drafts from public feed!
                .Select(p => new 
                {
                    id = p.Id,
                    title = p.Title,
                    description = p.Description,
                    faculty = p.Faculty,
                    deadline = p.Deadline,
                    status = p.Status,
                    memberCount = p.Members.Count() 
                })
                .OrderByDescending(p => p.id)
                .ToList();

            return Ok(projects);
        }

        // ---------------------------------------------------
        // 3. ACCEPT SUPERVISION & SEND AUTOMATED EMAIL
        // ---------------------------------------------------
        [HttpPost("supervise/{projectId}")]
        public IActionResult SuperviseProject(int projectId, [FromQuery] int supervisorId)
        {
            var project = _context.Projects.Find(projectId);
            
            if (project == null) 
                return NotFound(new { message = "Project not found." });

            if (project.SupervisorId != null)
                return BadRequest(new { message = "This project already has an assigned supervisor." });

            var supervisor = _context.AppUsers.Find(supervisorId);

            project.SupervisorId = supervisorId;
            project.Status = "Supervised"; 

            var automatedEmail = new Message
            {
                SenderId = null, 
                RecipientId = project.CreatedById, 
                Subject = $"Project Update: Supervisor Assigned ({project.Title})",
                Body = $"Great news! {supervisor?.FullName} ({supervisor?.Email}) has accepted your request to supervise the project '{project.Title}'. Please reach out to them via the internal mailing system to arrange your first meeting.",
                IsSystemNotification = true,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(automatedEmail);
            _context.SaveChanges();

            return Ok(new { message = "You have successfully accepted supervision and the student has been notified!" });
        }

        // ---------------------------------------------------
        // 4. GET DASHBOARD STATS FOR A SPECIFIC USER
        // ---------------------------------------------------
        [HttpGet("dashboard/{userId}")]
public IActionResult GetDashboardStats(int userId)
{
    // 1. Find all project IDs where the user is a member OR creator OR supervisor
    var projectIds = _context.Projects
        .Where(p => p.CreatedById == userId || p.SupervisorId == userId || p.Members.Any(m => m.UserId == userId && m.InviteStatus == "Accepted"))
        .Select(p => p.Id)
        .ToList();

    // 2. Count successful projects (Approved/Completed) within that specific group
    var successfulCount = _context.Projects
        .Count(p => projectIds.Contains(p.Id) && (p.Status == "Approved" || p.Status == "Completed"));

    // 3. Count active deadlines (Future dates) within that specific group
    var activeDeadlinesCount = _context.Projects
        .Count(p => projectIds.Contains(p.Id) && p.Deadline > DateTime.UtcNow);

    // 4. Fetch the actual project objects for the list
    var currentProjects = _context.Projects
        .Where(p => projectIds.Contains(p.Id))
        .Select(p => new {
            id = p.Id,
            title = p.Title,
            status = p.Status,
            memberCount = p.Members.Count(),
            // 🌟 Add a 'role' tag so the UI can show if they are Leader, Member, or Mentor
            role = p.CreatedById == userId ? "Leader" : (p.SupervisorId == userId ? "Supervisor" : "Member")
        })
        .OrderByDescending(p => p.id)
        .ToList();

    // 5. Fetch upcoming deadlines within that specific group
    var upcoming = _context.Projects
        .Where(p => projectIds.Contains(p.Id) && p.Deadline != null && p.Deadline >= DateTime.UtcNow.Date)
        .OrderBy(p => p.Deadline)
        .Select(p => new {
            id = p.Id,
            title = p.Title,
            deadline = p.Deadline,
            status = p.Status
        })
        .Take(3)
        .ToList();

    return Ok(new {
        successfulProjects = successfulCount,
        activeDeadlines = activeDeadlinesCount,
        currentProjects = currentProjects,
        upcomingDeadlines = upcoming
    });
}

        // ---------------------------------------------------
        // 7. GET SUPERVISED PROJECTS (Command Center)
        // ---------------------------------------------------
        [HttpGet("supervised/{supervisorId}")]
        public IActionResult GetSupervisedProjects(int supervisorId)
        {
            var projects = _context.Projects
                .Include(p => p.Members)
                    .ThenInclude(m => m.User) // Deep link to get the Student's Batch & Degree
                .Where(p => p.SupervisorId == supervisorId)
                .Select(p => new
                {
                    id = p.Id,
                    title = p.Title,
                    description = p.Description,
                    faculty = p.Faculty,
                    deadline = p.Deadline,
                    status = p.Status,
                    members = p.Members.Select(m => new {
                        id = m.Id,
                        userId = m.UserId,
                        name = m.User != null ? m.User.FullName : "Unknown Student",
                        email = m.User != null ? m.User.Email : "",
                        batch = m.User != null ? m.User.Batch : "N/A",
                        degreeProgram = m.User != null ? m.User.DegreeProgram : "N/A",
                        inviteStatus = m.InviteStatus
                    }).ToList()
                })
                .OrderByDescending(p => p.deadline)
                .ToList();

            return Ok(projects);
        }

        // ---------------------------------------------------
        // 5. DELETE A PROJECT
        // ---------------------------------------------------
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteProject(int id)
        {
            var project = _context.Projects.Find(id);
            if (project == null) 
            {
                return NotFound(new { message = "Project not found." });
            }

            var members = _context.ProjectMembers.Where(m => m.ProjectId == id).ToList();
            _context.ProjectMembers.RemoveRange(members);

            _context.Projects.Remove(project);
            _context.SaveChanges();

            return Ok(new { message = "Project deleted successfully!" });
        }

        // ---------------------------------------------------
        // 6. HANDLE INVITATION RESPONSES
        // ---------------------------------------------------
        [HttpPost("respond-invite")]
        public IActionResult RespondToInvite([FromBody] InviteResponseDto dto)
        {
            // 1. Extract the Project Title from the email subject line
            var prefix = "Team Invitation: ";
            if (!dto.Subject.StartsWith(prefix)) 
                return BadRequest(new { message = "Invalid invitation subject." });
            
            var projectTitle = dto.Subject.Substring(prefix.Length);

            // 2. Find the Draft Project and its Members
            var project = _context.Projects
                .Include(p => p.Members)
                .FirstOrDefault(p => p.Title == projectTitle && p.Status == "Draft");

            if (project == null) 
                return NotFound(new { message = "Project not found or is no longer a Draft." });

            // 3. Find the specific student in the project's roster
            var member = project.Members.FirstOrDefault(m => m.UserId == dto.UserId);
            if (member == null) 
                return NotFound(new { message = "You are not listed as a member of this project." });

            if (member.InviteStatus != "Pending")
                return BadRequest(new { message = "You have already responded to this invitation." });

            // 4. Apply their decision
            if (dto.Action == "Accept") {
                member.InviteStatus = "Accepted";
            } else if (dto.Action == "Reject") {
                member.InviteStatus = "Rejected"; 
            } else {
                return BadRequest(new { message = "Invalid action." });
            }

            // 🌟 5. THE LAUNCH CHECK: Are we waiting on anyone else? 🌟
            bool isWaitingOnOthers = project.Members.Any(m => m.InviteStatus == "Pending");

            if (!isWaitingOnOthers)
            {
                // Everyone has answered! Upgrade the project to live status.
                project.Status = "Pending"; 

                // Send a celebratory automated email to the Project Creator
                var systemMsg = new Message
                {
                    SenderId = null,
                    RecipientId = project.CreatedById,
                    Subject = $"Project Launched: {project.Title}",
                    Body = $"Great news! All invited team members have responded. Your project '{project.Title}' has officially been published to the Research Feed and is now waiting for a Supervisor to claim it.",
                    IsSystemNotification = true,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Messages.Add(systemMsg);
            }

            _context.SaveChanges();

            return Ok(new { message = $"You have successfully {dto.Action.ToLower()}ed the invitation." });
        }

        // 8. MARK PROJECT AS COMPLETED
[HttpPut("complete/{projectId}")]
public IActionResult MarkAsCompleted(int projectId)
{
    var project = _context.Projects.Find(projectId);
    if (project == null) return NotFound();

    project.Status = "Completed"; // This removes it from Feed and Workspace lists automatically
    _context.SaveChanges();
    return Ok(new { message = "Project moved to archive." });
}

// 9. SUBMIT GRADE (Module Leader Only)
[HttpPost("grade")]
public IActionResult SubmitGrade([FromBody] ProjectGrade grade)
{
    _context.ProjectGrades.Add(grade);
    
    // Update project status to Graded
    var project = _context.Projects.Find(grade.ProjectId);
    if(project != null) project.Status = "Graded";

    _context.SaveChanges();
    return Ok(new { message = "Marks published successfully." });
}

// 10. GET GRADE FOR A PROJECT
[HttpGet("grade/{projectId}")]
public IActionResult GetProjectGrade(int projectId)
{
    var grade = _context.ProjectGrades
        .FirstOrDefault(g => g.ProjectId == projectId);
    
    if (grade == null) return NotFound();
    return Ok(grade);
}

    [HttpGet("all-completed")]
public IActionResult GetAllCompletedProjects()
{
    var projects = _context.Projects
        .Include(p => p.Members)
        .Where(p => p.Status == "Completed")
        .Select(p => new {
            id = p.Id,
            title = p.Title,
            faculty = p.Faculty,
            deadline = p.Deadline,
            memberCount = p.Members.Count()
        })
        .ToList();

    return Ok(projects);
}

        [HttpGet("results/{projectId}")]
public IActionResult GetProjectResults(int projectId)
{
    var project = _context.Projects.Find(projectId);
    var grade = _context.ProjectGrades.FirstOrDefault(g => g.ProjectId == projectId);

    if (project == null || grade == null)
        return NotFound(new { message = "Results are not published yet." });

    return Ok(new {
        title = project.Title,
        status = project.Status,
        marks = grade.Marks,
        feedback = grade.Feedback,
        gradedAt = grade.GradedAt
    });
}

    }
}


// ---------------------------------------------------
// DTO DEFINITIONS
// ---------------------------------------------------
namespace PAS.Server.DTOs
{
    

    public class InviteResponseDto
    {
        public int UserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // "Accept" or "Reject"
    }
}