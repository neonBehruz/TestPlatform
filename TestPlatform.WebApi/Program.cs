using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using TestPlatform.Data;
using TestPlatform.Domain;
using TestPlatform.Service;

var builder = WebApplication.CreateBuilder(args);

// Add Database Context (SQLite default for effortless local running + PostgreSQL compatible)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=TestPlatformDb.db";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (connectionString.Contains("Host="))
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite(connectionString);
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "SuperSecretKeyForTestPlatformSystem2026_Minimum32BytesLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TestPlatformAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TestPlatformClients";

builder.Services.AddSingleton<IJwtService>(new JwtService(jwtSecret, jwtIssuer, jwtAudience));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();

// Register Application Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<ITopicService, TopicService>();
builder.Services.AddScoped<ITestService, TestService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAttemptService, AttemptService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddHttpClient();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure Database Created & Seed Data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // Ensure new tables are created for SQLite if schema was updated
    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS ""Announcements"" (
            ""Id"" TEXT NOT NULL CONSTRAINT ""PK_Announcements"" PRIMARY KEY,
            ""Title"" TEXT NOT NULL,
            ""Content"" TEXT NOT NULL,
            ""Category"" TEXT NOT NULL,
            ""Icon"" TEXT NOT NULL,
            ""IsPinned"" INTEGER NOT NULL,
            ""IsPublished"" INTEGER NOT NULL,
            ""AuthorName"" TEXT NOT NULL,
            ""CreatedAt"" TEXT NOT NULL,
            ""UpdatedAt"" TEXT NULL
        );
        CREATE TABLE IF NOT EXISTS ""PaymentTransactions"" (
            ""Id"" TEXT NOT NULL CONSTRAINT ""PK_PaymentTransactions"" PRIMARY KEY,
            ""UserId"" TEXT NOT NULL,
            ""PlanName"" TEXT NOT NULL,
            ""Amount"" TEXT NOT NULL,
            ""Status"" TEXT NOT NULL,
            ""PaymentMethod"" TEXT NOT NULL,
            ""PromoCode"" TEXT NULL,
            ""ExpiresAt"" TEXT NULL,
            ""CreatedAt"" TEXT NOT NULL,
            ""UpdatedAt"" TEXT NULL
        );
    ");

    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""IsPremium"" INTEGER NOT NULL DEFAULT 0;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""PremiumPlan"" TEXT NOT NULL DEFAULT 'Free';"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""PremiumUntil"" TEXT NULL;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""PhoneNumber"" TEXT NULL;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""AvatarUrl"" TEXT NULL;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Users"" ADD COLUMN ""Username"" TEXT NULL;"); } catch { }

    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Tests"" ADD COLUMN ""IsPremiumOnly"" INTEGER NOT NULL DEFAULT 0;"); } catch { }

    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Certificates"" ADD COLUMN ""IsPremium"" INTEGER NOT NULL DEFAULT 0;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Certificates"" ADD COLUMN ""Tier"" TEXT NOT NULL DEFAULT 'Standard';"); } catch { }

    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Questions"" ADD COLUMN ""Difficulty"" INTEGER NOT NULL DEFAULT 1;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Questions"" ADD COLUMN ""QuestionType"" INTEGER NOT NULL DEFAULT 0;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Questions"" ADD COLUMN ""Explanation"" TEXT NOT NULL DEFAULT '';"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Questions"" ADD COLUMN ""Hint"" TEXT NULL;"); } catch { }
    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Questions"" ADD COLUMN ""OrderIndex"" INTEGER NOT NULL DEFAULT 0;"); } catch { }

    try { db.Database.ExecuteSqlRaw(@"ALTER TABLE ""Options"" ADD COLUMN ""OrderIndex"" INTEGER NOT NULL DEFAULT 0;"); } catch { }

    try { db.Database.ExecuteSqlRaw(@"UPDATE ""Users"" SET ""FullName"" = 'Admin Administrator', ""Email"" = 'admin@testplatform.uz', ""Username"" = 'admin' WHERE ""Role"" = 1 OR ""Email"" = 'behruzsagdullayev0707@gmail.com';"); } catch { }

    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    authService.SeedDefaultAdminAsync().GetAwaiter().GetResult();
}

app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment() || true)
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Test Platform API - Scalar Docs";
    });
}

app.MapControllers();

app.Run();
