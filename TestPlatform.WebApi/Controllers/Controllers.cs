using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestPlatform.Data;
using TestPlatform.Domain;
using TestPlatform.Service;
using TestPlatform.Service.DTOs;

namespace TestPlatform.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("send-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] SendCodeDto dto)
        {
            var res = await _authService.SendVerificationCodeAsync(dto.Email);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var res = await _authService.RegisterAsync(dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var res = await _authService.LoginAsync(dto);
            if (!res.Success) return Unauthorized(res);
            return Ok(res);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var res = await _authService.GetMeAsync(userId);
            return Ok(res);
        }

        [HttpPut("profile/{userId:guid}")]
        public async Task<IActionResult> UpdateProfile(Guid userId, [FromBody] UpdateProfileDto dto)
        {
            var res = await _authService.UpdateProfileAsync(userId, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPut("change-password/{userId:guid}")]
        public async Task<IActionResult> ChangePassword(Guid userId, [FromBody] ChangePasswordDto dto)
        {
            var res = await _authService.ChangePasswordAsync(userId, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        public SubjectsController(ISubjectService subjectService) => _subjectService = subjectService;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _subjectService.GetAllSubjectsAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var res = await _subjectService.GetSubjectByIdAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto)
        {
            var res = await _subjectService.CreateSubjectAsync(dto);
            return Ok(res);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateSubjectDto dto)
        {
            var res = await _subjectService.UpdateSubjectAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var res = await _subjectService.DeleteSubjectAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TopicsController : ControllerBase
    {
        private readonly ITopicService _topicService;
        public TopicsController(ITopicService topicService) => _topicService = topicService;

        [HttpGet("by-subject/{subjectId:guid}")]
        public async Task<IActionResult> GetBySubject(Guid subjectId) => Ok(await _topicService.GetTopicsBySubjectAsync(subjectId));

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> Create([FromBody] CreateTopicDto dto) => Ok(await _topicService.CreateTopicAsync(dto));
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TestsController : ControllerBase
    {
        private readonly ITestService _testService;
        private readonly IQuestionService _questionService;

        public TestsController(ITestService testService, IQuestionService questionService)
        {
            _testService = testService;
            _questionService = questionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTests([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] Guid? subjectId = null, [FromQuery] bool? isPublished = null, [FromQuery] string? difficulty = null)
        {
            return Ok(await _testService.GetTestsAsync(page, pageSize, search, subjectId, isPublished, difficulty));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTestById(Guid id)
        {
            var res = await _testService.GetTestByIdAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> CreateTest([FromBody] CreateTestDto dto) => Ok(await _testService.CreateTestAsync(dto));

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateTest(Guid id, [FromBody] CreateTestDto dto)
        {
            var res = await _testService.UpdateTestAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPatch("{id:guid}/publish")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> PublishTest(Guid id, [FromQuery] bool isPublished = true)
        {
            var res = await _testService.PublishTestAsync(id, isPublished);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> DeleteTest(Guid id)
        {
            var res = await _testService.DeleteTestAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost("{id:guid}/questions")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> AddQuestion(Guid id, [FromBody] CreateQuestionDto dto)
        {
            var res = await _questionService.AddQuestionAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPut("{id:guid}/questions/{questionId:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateQuestion(Guid id, Guid questionId, [FromBody] CreateQuestionDto dto)
        {
            var res = await _questionService.UpdateQuestionAsync(questionId, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpDelete("{id:guid}/questions/{questionId:guid}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> DeleteQuestion(Guid id, Guid questionId)
        {
            var res = await _questionService.DeleteQuestionAsync(questionId);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost("{id:guid}/questions/import")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> BulkImport(Guid id, [FromBody] BulkImportQuestionsDto dto)
        {
            var res = await _questionService.BulkImportQuestionsAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/student-tests")]
    public class StudentTestsController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        public StudentTestsController(IAttemptService attemptService) => _attemptService = attemptService;

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetStudentTest(Guid id)
        {
            var res = await _attemptService.GetStudentTestAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost("{id:guid}/submit")]
        public async Task<IActionResult> SubmitTest(Guid id, [FromBody] SubmitTestDto dto)
        {
            var res = await _attemptService.SubmitTestAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IAttemptService _attemptService;
        public ProfileController(IAttemptService attemptService) => _attemptService = attemptService;

        [HttpGet("attempts")]
        [Authorize]
        public async Task<IActionResult> GetMyAttempts()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var res = await _attemptService.GetUserAttemptsAsync(userId);
            return Ok(res);
        }

        [HttpGet("attempts/{attemptId:guid}/review")]
        public async Task<IActionResult> GetAttemptReview(Guid attemptId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdStr, out var userId);

            var res = await _attemptService.GetAttemptReviewAsync(attemptId, userId);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary() => Ok(await _dashboardService.GetSummaryAsync());

        [HttpGet("student")]
        public async Task<IActionResult> GetStudentDashboard([FromQuery] Guid? studentId)
        {
            var targetId = studentId;
            if (!targetId.HasValue || targetId.Value == Guid.Empty)
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (Guid.TryParse(userIdStr, out var parsedId))
                {
                    targetId = parsedId;
                }
            }

            var res = await _dashboardService.GetStudentDashboardAsync(targetId ?? Guid.Empty);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly IAnnouncementService _service;
        public AnnouncementsController(IAnnouncementService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool? all)
        {
            var isAll = all == true && User.IsInRole("Admin");
            var res = await _service.GetAllAsync(!isAll);
            return Ok(res);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var res = await _service.GetByIdAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto)
        {
            var name = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";
            var res = await _service.CreateAsync(dto, name);
            if (!res.Success) return BadRequest(res);
            return CreatedAtAction(nameof(GetById), new { id = res.Data!.Id }, res);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnnouncementDto dto)
        {
            var res = await _service.UpdateAsync(id, dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var res = await _service.DeleteAsync(id);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardService _leaderboardService;
        public LeaderboardController(ILeaderboardService leaderboardService) => _leaderboardService = leaderboardService;

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobal([FromQuery] int top = 10) => Ok(await _leaderboardService.GetGlobalLeaderboardAsync(top));

        [HttpGet("test/{testId:guid}")]
        public async Task<IActionResult> GetTestLeaderboard(Guid testId, [FromQuery] int top = 10) => Ok(await _leaderboardService.GetTestLeaderboardAsync(testId, top));
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly ICertificateService _certificateService;
        public CertificatesController(ICertificateService certificateService) => _certificateService = certificateService;

        [HttpGet("{certNumber}")]
        public async Task<IActionResult> GetByNumber(string certNumber)
        {
            var res = await _certificateService.GetCertificateByNumberAsync(certNumber);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpGet("by-attempt/{attemptId:guid}")]
        public async Task<IActionResult> GetByAttempt(Guid attemptId)
        {
            var res = await _certificateService.GetCertificateByAttemptIdAsync(attemptId);
            if (!res.Success) return NotFound(res);
            return Ok(res);
        }

        [HttpGet("student/{studentId:guid}")]
        public async Task<IActionResult> GetByStudent(Guid studentId)
        {
            var res = await _certificateService.GetStudentCertificatesAsync(studentId);
            return Ok(res);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyCertificates()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

            var res = await _certificateService.GetStudentCertificatesAsync(userId);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/audit-logs")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        public AuditLogsController(IAuditLogService auditLogService) => _auditLogService = auditLogService;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetLogs([FromQuery] int top = 50) => Ok(await _auditLogService.GetLogsAsync(top));
    }

    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersController(AppDbContext db) => _db = db;

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _db.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, statusCode = 200, message = "Foydalanuvchilar ro'yxati", data = users });
        }

        [HttpGet("teachers")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetTeachers()
        {
            var testsCount = await _db.Tests.CountAsync();
            var questionsCount = await _db.Questions.CountAsync();
            var teachers = await _db.Users
                .Where(u => u.Role == UserRole.Teacher)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new TeacherUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    CreatedTestsCount = testsCount,
                    TotalQuestionsCount = questionsCount
                })
                .ToListAsync();

            return Ok(new { success = true, statusCode = 200, message = "O'qituvchilar ro'yxati", data = teachers });
        }

        [HttpPost("create-teacher")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { success = false, message = "Ism, email va parol kiritilishi shart" });

            var email = dto.Email.Trim().ToLower();
            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == email))
                return BadRequest(new { success = false, message = "Ushbu email bilan foydalanuvchi allaqachon mavjud" });

            var teacher = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PasswordHash = PasswordHasher.HashPassword(dto.Password),
                Role = UserRole.Teacher,
                IsActive = true
            };

            _db.Users.Add(teacher);
            await _db.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                statusCode = 200, 
                message = "Yangi o'qituvchi muvaffaqiyatli yaratildi", 
                data = new TeacherUserDto
                {
                    Id = teacher.Id,
                    FullName = teacher.FullName,
                    Email = teacher.Email,
                    Role = "Teacher",
                    IsActive = teacher.IsActive,
                    CreatedAt = teacher.CreatedAt
                } 
            });
        }

        [HttpPut("{id:guid}/set-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetUserRole(Guid id, [FromBody] SetUserRoleDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "Foydalanuvchi topilmadi" });

            if (Enum.TryParse<UserRole>(dto.Role, true, out var role))
            {
                user.Role = role;
                user.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return Ok(new { 
                    success = true, 
                    message = $"Foydalanuvchi roli '{role}' ga o'zgartirildi", 
                    data = new { user.Id, user.FullName, user.Email, Role = user.Role.ToString() } 
                });
            }

            return BadRequest(new { success = false, message = "Noto'g'ri rol kiritildi (Admin, Teacher, Student)" });
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetUserStats()
        {
            var totalUsers = await _db.Users.CountAsync();
            var totalStudents = await _db.Users.CountAsync(u => u.Role == UserRole.Student);
            var totalTeachers = await _db.Users.CountAsync(u => u.Role == UserRole.Teacher);
            var totalAdmins = await _db.Users.CountAsync(u => u.Role == UserRole.Admin);

            return Ok(new {
                success = true,
                data = new {
                    totalUsers,
                    totalStudents,
                    totalTeachers,
                    totalAdmins
                }
            });
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound(new { success = false, statusCode = 404, message = "Foydalanuvchi topilmadi" });
            
            var attempts = await _db.TestAttempts.Where(a => a.StudentId == id).ToListAsync();
            var attemptIds = attempts.Select(a => a.Id).ToList();
            var answers = await _db.AttemptAnswers.Where(a => attemptIds.Contains(a.TestAttemptId)).ToListAsync();
            _db.AttemptAnswers.RemoveRange(answers);
            _db.TestAttempts.RemoveRange(attempts);

            var certs = await _db.Certificates.Where(c => c.StudentId == id).ToListAsync();
            _db.Certificates.RemoveRange(certs);

            var payments = await _db.PaymentTransactions.Where(p => p.UserId == id).ToListAsync();
            _db.PaymentTransactions.RemoveRange(payments);

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return Ok(new { success = true, statusCode = 200, message = "Foydalanuvchi va uning barcha ma'lumotlari o'chirildi" });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("hint")]
        public async Task<IActionResult> GetHint([FromBody] AiHintRequestDto dto)
        {
            var res = await _aiService.GetHintAsync(dto);
            return Ok(res);
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AiChatRequestDto dto)
        {
            var res = await _aiService.ChatAsync(dto);
            return Ok(res);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            var res = await _subscriptionService.GetPlansAsync();
            return Ok(res);
        }

        [HttpGet("my-status")]
        [Authorize]
        public async Task<IActionResult> GetMyStatus()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { success = false, message = "Avtorizatsiyadan o'tilmagan" });

            var res = await _subscriptionService.GetStatusAsync(userId);
            return Ok(res);
        }

        [HttpPost("upgrade")]
        [Authorize]
        public async Task<IActionResult> Upgrade([FromBody] UpgradeSubscriptionDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { success = false, message = "Avtorizatsiyadan o'tilmagan" });

            var res = await _subscriptionService.SubscribeAsync(userId, dto);
            return Ok(res);
        }

        [HttpPost("promo-code")]
        [Authorize]
        public async Task<IActionResult> ApplyPromoCode([FromBody] ApplyPromoCodeDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { success = false, message = "Avtorizatsiyadan o'tilmagan" });

            var res = await _subscriptionService.ApplyPromoCodeAsync(userId, dto.Code);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpGet("validate-promo")]
        public async Task<IActionResult> ValidatePromoCode([FromQuery] string code)
        {
            var res = await _subscriptionService.ValidatePromoCodeAsync(code);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpPost("validate-promo")]
        public async Task<IActionResult> ValidatePromoCodePost([FromBody] ApplyPromoCodeDto dto)
        {
            var res = await _subscriptionService.ValidatePromoCodeAsync(dto.Code);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }

        [HttpGet("check-access/{testId:guid}")]
        [Authorize]
        public async Task<IActionResult> CheckAccess(Guid testId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { success = false, message = "Avtorizatsiyadan o'tilmagan" });

            var res = await _subscriptionService.VerifyTestAccessAsync(userId, testId);
            return Ok(res);
        }

        [HttpPost("admin/grant")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminGrant([FromBody] GrantPremiumDto dto)
        {
            var res = await _subscriptionService.AdminGrantPremiumAsync(dto);
            if (!res.Success) return BadRequest(res);
            return Ok(res);
        }
    }
}

