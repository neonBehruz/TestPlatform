using System.Collections.Generic;

namespace TestPlatform.Domain
{
    public class User : Auditable
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Student;
        public bool IsActive { get; set; } = true;
        public bool IsPremium { get; set; } = false;
        public string PremiumPlan { get; set; } = "Free";
        public DateTime? PremiumUntil { get; set; }
    }

    public class Subject : Auditable
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public ICollection<Topic> Topics { get; set; } = new List<Topic>();
        public ICollection<Test> Tests { get; set; } = new List<Test>();
    }

    public class Topic : Auditable
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public Subject? Subject { get; set; }
        public ICollection<TestTopic> TestTopics { get; set; } = new List<TestTopic>();
    }

    public class Test : Auditable
    {
        public Guid SubjectId { get; set; }
        public Subject? Subject { get; set; }
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

        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<TestTopic> TestTopics { get; set; } = new List<TestTopic>();
        public ICollection<TestAttempt> Attempts { get; set; } = new List<TestAttempt>();
    }

    public class TestTopic
    {
        public Guid TestId { get; set; }
        public Test? Test { get; set; }
        public Guid TopicId { get; set; }
        public Topic? Topic { get; set; }
    }

    public class Question : Auditable
    {
        public Guid TestId { get; set; }
        public Test? Test { get; set; }
        public string Text { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string QuestionText { get => Text; set => Text = value; }
        public QuestionType QuestionType { get; set; } = QuestionType.SingleChoice;
        public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Medium;
        public int Points { get; set; } = 1;
        public string Explanation { get; set; } = string.Empty;
        public string? Hint { get; set; }
        public int OrderIndex { get; set; } = 0;

        public ICollection<Option> Options { get; set; } = new List<Option>();
    }

    public class Option : Auditable
    {
        public Guid QuestionId { get; set; }
        public Question? Question { get; set; }
        public string Text { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string OptionText { get => Text; set => Text = value; }
        public bool IsCorrect { get; set; } = false;
        public int OrderIndex { get; set; } = 0;
    }

    public class TestAttempt : Auditable
    {
        public Guid TestId { get; set; }
        public Test? Test { get; set; }
        public Guid StudentId { get; set; }
        public User? Student { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SubmittedAt { get; set; }
        public int TotalScore { get; set; }
        public int EarnedScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public int DurationSeconds { get; set; }
        public bool IsExpired { get; set; }

        public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
        public Certificate? Certificate { get; set; }
    }

    public class AttemptAnswer : Auditable
    {
        public Guid TestAttemptId { get; set; }
        public TestAttempt? TestAttempt { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public Guid AttemptId { get => TestAttemptId; set => TestAttemptId = value; }
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public TestAttempt? Attempt { get => TestAttempt; set => TestAttempt = value; }
        public Guid QuestionId { get; set; }
        public Question? Question { get; set; }
        public Guid SelectedOptionId { get; set; }
        public Option? SelectedOption { get; set; }
        public int EarnedPoints { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class Certificate : Auditable
    {
        public Guid AttemptId { get; set; }
        public TestAttempt? Attempt { get; set; }
        public Guid StudentId { get; set; }
        public User? Student { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string TestTitle { get; set; } = string.Empty;
        public string CertificateNumber { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public bool IsPremium { get; set; } = false;
        public string Tier { get; set; } = "Standard";
    }

    public class AuditLog : Auditable
    {
        public Guid? UserId { get; set; }
        public string UserName { get; set; } = "System";
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
    }

    public class Announcement : Auditable
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Category { get; set; } = "Yangilik"; // Yangilik, E'lon, Yangilanish, Olimpiada
        public string Icon { get; set; } = "campaign";
        public bool IsPinned { get; set; } = false;
        public bool IsPublished { get; set; } = true;
        public string AuthorName { get; set; } = "Admin";
    }

    public class PaymentTransaction : Auditable
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }
        public string PlanName { get; set; } = "Pro";
        public decimal Amount { get; set; }
        public string Status { get; set; } = "Completed";
        public DateTime? ExpiresAt { get; set; }
        public string PaymentMethod { get; set; } = "Demo";
        public string? PromoCode { get; set; }
    }
}
