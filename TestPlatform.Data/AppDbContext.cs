using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using TestPlatform.Domain;

namespace TestPlatform.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<Topic> Topics => Set<Topic>();
        public DbSet<Test> Tests => Set<Test>();
        public DbSet<TestTopic> TestTopics => Set<TestTopic>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Option> Options => Set<Option>();
        public DbSet<TestAttempt> TestAttempts => Set<TestAttempt>();
        public DbSet<AttemptAnswer> AttemptAnswers => Set<AttemptAnswer>();
        public DbSet<Certificate> Certificates => Set<Certificate>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<Announcement> Announcements => Set<Announcement>();
        public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TestTopic composite key
            modelBuilder.Entity<TestTopic>()
                .HasKey(tt => new { tt.TestId, tt.TopicId });

            modelBuilder.Entity<TestTopic>()
                .HasOne(tt => tt.Test)
                .WithMany(t => t.TestTopics)
                .HasForeignKey(tt => tt.TestId);

            modelBuilder.Entity<TestTopic>()
                .HasOne(tt => tt.Topic)
                .WithMany(tp => tp.TestTopics)
                .HasForeignKey(tt => tt.TopicId);

            // User Email uniqueness
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Certificate CertificateNumber uniqueness
            modelBuilder.Entity<Certificate>()
                .HasIndex(c => c.CertificateNumber)
                .IsUnique();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<Auditable>();
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity.CreatedAt == default)
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
