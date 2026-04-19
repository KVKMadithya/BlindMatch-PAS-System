using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PAS.Server.Data;
using PAS.Server.Models;
using PAS.Server.DTOs;

namespace PAS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MailController(AppDbContext context) { _context = context; }

        [HttpGet("inbox/{userId}")]
        public IActionResult GetInbox(int userId)
        {
            var inbox = _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.RecipientId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.CreatedAt,
                    m.IsRead,
                    m.IsSystemNotification,
                    SenderName = m.Sender != null ? m.Sender.FullName : "BlindMatch System",
                    SenderRole = m.Sender != null ? m.Sender.Role : "System",
                    SenderPhoto = m.Sender != null ? m.Sender.ProfilePicturePath : null
                }).ToList();

            return Ok(inbox);
        }

        [HttpGet("sent/{userId}")]
        public IActionResult GetSentMail(int userId)
        {
            var sent = _context.Messages
                .Include(m => m.Recipient)
                .Where(m => m.SenderId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.CreatedAt,
                    RecipientName = m.Recipient != null ? m.Recipient.FullName : "Unknown",
                    RecipientRole = m.Recipient != null ? m.Recipient.Role : "Unknown"
                }).ToList();

            return Ok(sent);
        }

        [HttpPost("send")]
        public IActionResult SendMail([FromBody] SendMessageDto dto)
        {
            var message = new Message
            {
                SenderId = dto.SenderId,
                RecipientId = dto.RecipientId,
                Subject = dto.Subject,
                Body = dto.Body,
                IsSystemNotification = false
            };

            _context.Messages.Add(message);
            _context.SaveChanges();

            return Ok(new { message = "Email dispatched successfully." });
        }

        [HttpPut("read/{messageId}")]
        public IActionResult MarkAsRead(int messageId)
        {
            var msg = _context.Messages.Find(messageId);
            if (msg != null)
            {
                msg.IsRead = true;
                _context.SaveChanges();
            }
            return Ok();
        }
    }
}