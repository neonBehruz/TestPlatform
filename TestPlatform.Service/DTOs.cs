using System;
using System.Collections.Generic;
using TestPlatform.Domain;

namespace TestPlatform.Service.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public int StatusCode { get; set; } = 200;
        public string Message { get; set; } = "Success";
        public T? Data { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Muvaffaqiyatli bajarildi")
        {
            return new ApiResponse<T> { Success = true, StatusCode = 200, Message = message, Data = data };
        }

        public static ApiResponse<T> Fail(string message, int statusCode = 400)
        {
            return new ApiResponse<T> { Success = false, StatusCode = statusCode, Message = message, Data = default };
        }
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / (PageSize > 0 ? PageSize : 1));
    }

    // Auth DTOs
    public class SendCodeDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? VerificationCode { get; set; }
        public UserRole Role { get; set; } = UserRole.Student;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? VerificationCode { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string? VerificationCode { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = new UserDto();
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsPremium { get; set; } = false;
        public string PremiumPlan { get; set; } = "Free";
        public DateTime? PremiumUntil { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Subject DTOs
    public class SubjectDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TestsCount { get; set; }
        public int TopicsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSubjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Topic DTOs
    public class TopicDto
    {
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateTopicDto
    {
        public Guid SubjectId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Test DTOs
    public class TestDto
    {
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int PassingPercentage { get; set; }
        public int TimeLimitMinutes { get; set; }
        public int MaxAttemptsPerStudent { get; set; }
        public string Difficulty { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public bool IsPremiumOnly { get; set; } = false;
        public bool ShowReviewAfterSubmit { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public int QuestionsCount { get; set; }
        public List<string> Topics { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTestDto
    {
        public Guid SubjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int PassingPercentage { get; set; } = 60;
        public int TimeLimitMinutes { get; set; } = 30;
        public int MaxAttemptsPerStudent { get; set; } = 3;
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Medium;
        public bool IsPublished { get; set; } = false;
        public bool IsPremiumOnly { get; set; } = false;
        public bool ShowReviewAfterSubmit { get; set; } = true;
        public bool ShowCorrectAnswers { get; set; } = true;
        public List<Guid> TopicIds { get; set; } = new List<Guid>();
    }

    public class UpdateTestDto
    {
        public Guid SubjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int PassingPercentage { get; set; }
        public int TimeLimitMinutes { get; set; }
        public int MaxAttemptsPerStudent { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public bool IsPublished { get; set; }
        public bool IsPremiumOnly { get; set; } = false;
        public bool ShowReviewAfterSubmit { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public List<Guid> TopicIds { get; set; } = new List<Guid>();
    }

    public class TestDetailDto : TestDto
    {
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }

    public class StudentTestDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int TimeLimitMinutes { get; set; }
        public int PassingPercentage { get; set; }
        public int QuestionsCount { get; set; }
        public List<StudentQuestionDto> Questions { get; set; } = new List<StudentQuestionDto>();
    }

    public class QuestionDto
    {
        public Guid Id { get; set; }
        public Guid TestId { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Points { get; set; }
        public string Difficulty { get; set; } = "Medium";
        public List<OptionDto> Options { get; set; } = new List<OptionDto>();
    }

    public class StudentQuestionDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Points { get; set; }
        public string Difficulty { get; set; } = "Medium";
        public List<StudentOptionDto> Options { get; set; } = new List<StudentOptionDto>();
    }

    public class OptionDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class StudentOptionDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    public class CreateQuestionDto
    {
        public string Text { get; set; } = string.Empty;
        public int Points { get; set; } = 1;
        public string? Difficulty { get; set; }
        public List<CreateOptionDto> Options { get; set; } = new List<CreateOptionDto>();
    }

    public class CreateOptionDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    // Submit DTOs
    public class SubmitTestDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public List<SubmitAnswerDto> Answers { get; set; } = new List<SubmitAnswerDto>();
    }

    public class SubmitAnswerDto
    {
        public Guid QuestionId { get; set; }
        public Guid SelectedOptionId { get; set; }
    }

    public class AttemptResultDto
    {
        public Guid AttemptId { get; set; }
        public Guid TestId { get; set; }
        public string TestTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public int EarnedScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public int DurationSeconds { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public Guid? CertificateId { get; set; }
        public string? CertificateNumber { get; set; }
    }

    public class AttemptReviewDto
    {
        public Guid AttemptId { get; set; }
        public Guid TestId { get; set; }
        public string TestTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public int EarnedScore { get; set; }
        public int TotalScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public List<QuestionReviewDto> Questions { get; set; } = new List<QuestionReviewDto>();
    }

    public class QuestionReviewDto
    {
        public Guid QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int Points { get; set; }
        public Guid SelectedOptionId { get; set; }
        public Guid CorrectOptionId { get; set; }
        public bool IsCorrect { get; set; }
        public string Explanation { get; set; } = string.Empty;
        public List<OptionDto> Options { get; set; } = new List<OptionDto>();
    }

    // Dashboard DTOs
    public class DashboardSummaryDto
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalSubjects { get; set; }
        public int TotalTests { get; set; }
        public int TotalPublishedTests { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalAttempts { get; set; }
        public double AveragePercentage { get; set; }
        public int PassedAttempts { get; set; }
        public int FailedAttempts { get; set; }
        public List<RecentAttemptDto> RecentAttempts { get; set; } = new List<RecentAttemptDto>();
        public List<TopTestDto> TopTests { get; set; } = new List<TopTestDto>();
    }

    public class RecentAttemptDto
    {
        public Guid Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }

    public class TopTestDto
    {
        public Guid TestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int AttemptsCount { get; set; }
        public double AverageScore { get; set; }
    }

    // Leaderboard DTOs
    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public double Percentage { get; set; }
        public int DurationSeconds { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public string? CertificateNumber { get; set; }
        public bool IsPremium { get; set; } = false;
        public string PremiumPlan { get; set; } = "Free";
    }

    // Certificate DTOs
    public class CertificateDto
    {
        public Guid Id { get; set; }
        public Guid AttemptId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public string CertificateNumber { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = string.Empty;
        public bool IsPremium { get; set; } = false;
        public string Tier { get; set; } = "Standard";
        public DateTime IssuedAt { get; set; }
    }

    // Audit Log DTOs
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // Bulk Import DTOs
    public class BulkImportQuestionsDto
    {
        public List<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
    }

    public class ImportResultDto
    {
        public int TotalCount { get; set; }
        public int ImportedCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    // AI Assistant & Socratic Mentor DTOs
    public class AiHintRequestDto
    {
        public Guid? QuestionId { get; set; }
        public string? QuestionText { get; set; }
        public string? SubjectName { get; set; }
        public string? UserPrompt { get; set; }
    }

    public class AiChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public string? CurrentQuestionText { get; set; }
        public string? SubjectName { get; set; }
        public List<AiChatMessageDto>? History { get; set; }
    }

    public class AiChatMessageDto
    {
        public string Role { get; set; } = "user"; // "user" or "assistant"
        public string Content { get; set; } = string.Empty;
    }

    public class AiResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public string? Topic { get; set; }
        public List<string> KeyConcepts { get; set; } = new List<string>();
        public List<string> SuggestedFollowUps { get; set; } = new List<string>();
    }

    // Announcement & News DTOs
    public class AnnouncementDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Yangilik";
        public string Icon { get; set; } = "campaign";
        public bool IsPinned { get; set; }
        public bool IsPublished { get; set; }
        public string AuthorName { get; set; } = "Admin";
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAnnouncementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Yangilik";
        public string Icon { get; set; } = "campaign";
        public bool IsPinned { get; set; } = false;
        public bool IsPublished { get; set; } = true;
    }

    public class UpdateAnnouncementDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Yangilik";
        public string Icon { get; set; } = "campaign";
        public bool IsPinned { get; set; }
        public bool IsPublished { get; set; }
    }

    // Student Dashboard DTO
    public class StudentDashboardDto
    {
        public int TotalTestsTaken { get; set; }
        public int PassedCount { get; set; }
        public double AveragePercentage { get; set; }
        public int CertificatesCount { get; set; }
        public int LeaderboardRank { get; set; }
        public List<AttemptResultDto> RecentAttempts { get; set; } = new List<AttemptResultDto>();
        public List<TestDto> RecommendedTests { get; set; } = new List<TestDto>();
        public List<AnnouncementDto> RecentAnnouncements { get; set; } = new List<AnnouncementDto>();
    }

    // Subscription & Pricing DTOs
    public class SubscriptionPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FormattedPrice { get; set; } = string.Empty;
        public string Currency { get; set; } = "UZS";
        public string BillingPeriod { get; set; } = "oy";
        public int DurationDays { get; set; } = 30;
        public string BadgeText { get; set; } = string.Empty;
        public bool IsPopular { get; set; } = false;
        public List<string> Features { get; set; } = new List<string>();
    }

    public class UpgradeSubscriptionDto
    {
        public string PlanId { get; set; } = "pro"; // free, pro, vip, lifetime
        public string PaymentMethod { get; set; } = "Payme"; // Payme, Click, Uzum
        public string? CardNumber { get; set; }
        public string? CardExpiry { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PromoCode { get; set; }
    }

    public class ApplyPromoCodeDto
    {
        public string Code { get; set; } = string.Empty;
    }

    public class PromoDiscountResultDto
    {
        public bool IsValid { get; set; }
        public string Code { get; set; } = string.Empty;
        public int DiscountPercentage { get; set; } = 20;
        public decimal DiscountPercentageDecimal => 0.20m;
        public string Message { get; set; } = string.Empty;
        public decimal DiscountedProPrice { get; set; } = 39200; // 49,000 * 0.8
        public decimal DiscountedVipPrice { get; set; } = 312000; // 390,000 * 0.8
        public decimal DiscountedLifetimePrice { get; set; } = 712000; // 890,000 * 0.8
    }

    public class GrantPremiumDto
    {
        public Guid TargetUserId { get; set; }
        public string PlanName { get; set; } = "Pro";
        public int DurationDays { get; set; } = 30;
        public bool IsPermanent { get; set; } = false;
    }

    public class SubscriptionStatusDto
    {
        public bool IsPremium { get; set; }
        public string PlanName { get; set; } = "Free";
        public DateTime? PremiumUntil { get; set; }
        public int DaysRemaining { get; set; }
        public List<PaymentTransactionDto> RecentTransactions { get; set; } = new List<PaymentTransactionDto>();
    }

    public class PaymentTransactionDto
    {
        public Guid Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? PromoCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    // Teacher Management DTOs
    public class CreateTeacherDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class SetUserRoleDto
    {
        public string Role { get; set; } = "Teacher"; // Admin, Teacher, Student
    }

    public class AdminEditUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? NewPassword { get; set; }
        public string? Role { get; set; }
    }

    public class GrantProPlanDto
    {
        public string Plan { get; set; } = "Pro";
        public int Days { get; set; } = 30;
    }

    public class ClientAuditLogDto
    {
        public string Action { get; set; } = string.Empty;
        public string? EntityName { get; set; } = "System";
        public string Details { get; set; } = string.Empty;
    }

    public class TeacherUserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Teacher";
        public bool IsActive { get; set; }
        public int CreatedTestsCount { get; set; }
        public int TotalQuestionsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}


