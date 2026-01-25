using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Services;
using KeciApp.API.Repositories;
using KeciApp.API.Mappings;
using KeciApp.API.Interfaces;
using KeciApp.API.Middleware;
using KeciApp.API.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using Serilog.Events;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for file logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        Path.Combine(builder.Environment.ContentRootPath, "logs", "app-.log"),
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Configure Kestrel server limits for large file uploads
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 6L * 1024 * 1024 * 1024; // 6 GB
    options.Limits.MaxRequestBufferSize = 6L * 1024 * 1024 * 1024; // 6 GB
    options.Limits.MaxRequestHeadersTotalSize = 32 * 1024; // 32 KB
});

// Configure form options for multipart/form-data uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 6L * 1024 * 1024 * 1024; // 6 GB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
    options.MultipartBoundaryLengthLimit = int.MaxValue;
});

// Add services to the container.
builder.Services.AddControllers(options =>
{
    // Increase request body size limit for all controllers
    options.MaxModelBindingCollectionSize = int.MaxValue;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "KeciApp API", 
        Version = "v1",
        Description = "KeciApp Backend API for Development"
    });
    
    // Handle file uploads in Swagger
    c.OperationFilter<KeciApp.API.Filters.FileUploadOperationFilter>();
    c.ParameterFilter<KeciApp.API.Filters.FileUploadParameterFilter>();
    c.SchemaFilter<KeciApp.API.Filters.FileUploadSchemaFilter>();
});

// Add Entity Framework DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add JWT and Auth Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure Authentication (JWT Bearer)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"]);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // Handle token validation events to mark daily content as completed
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            // Check if token has been inactive for more than 2 days
            var lastActivityClaim = context.Principal?.FindFirst("LastActivity");
            if (lastActivityClaim != null && DateTime.TryParse(lastActivityClaim.Value, out var lastActivity))
            {
                var daysSinceLastActivity = (DateTime.UtcNow - lastActivity).TotalDays;
                if (daysSinceLastActivity >= 2)
                {
                    // Token inactive for 2+ days, reject it
                    context.Fail("Token has been inactive for more than 2 days");
                    return;
                }
            }

            var userIdClaim = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                var scope = context.HttpContext.RequestServices.CreateScope();
                try
                {
                    var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
                    var userProgressService = scope.ServiceProvider.GetRequiredService<IUserProgressService>();
                    var dailyContentService = scope.ServiceProvider.GetRequiredService<IDailyContentService>();
                    
                    var user = await userRepository.GetUserByIdAsync(userId);
                    if (user != null && user.dailyOrWeekly)
                    {
                        int? dailyContentId = user.DailyContentId;
                        
                        // If user doesn't have DailyContentId, get/assign it first
                        if (!dailyContentId.HasValue)
                        {
                            var dailyContent = await dailyContentService.GetUsersDailyContentOrderAsync(user.UserId);
                            if (dailyContent != null)
                            {
                                dailyContentId = dailyContent.DailyContentId;
                            }
                        }

                        // Create progress record if we have a daily content ID
                        // CreateOrUpdateUserProgressAsync will check if it exists, so we can call it directly
                        if (dailyContentId.HasValue)
                        {
                            await userProgressService.CreateOrUpdateUserProgressAsync(new CreateUserProgressRequest
                            {
                                UserId = user.UserId,
                                DailyContentId = dailyContentId.Value,
                                IsCompleted = true
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't fail authentication
                    Serilog.Log.Warning(ex, "Error marking daily content as completed during token validation");
                }
                finally
                {
                    scope.Dispose();
                }
            }
        }
    };
});

// Add Repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IUserSeriesAccessRepository, UserSeriesAccessRepository>();
builder.Services.AddScoped<IAnswersRepository, AnswersRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<INotesRepository, NotesRepository>();
builder.Services.AddScoped<IFavoritesRepository, FavoritesRepository>();
builder.Services.AddScoped<IPodcastEpisodesRepository, PodcastEpisodesRepository>();
builder.Services.AddScoped<IPodcastSeriesRepository, PodcastSeriesRepository>();
builder.Services.AddScoped<IWeeklyRepository, WeeklyRepository>();
builder.Services.AddScoped<IWeeklyQuestionRepository, WeeklyQuestionRepository>();
builder.Services.AddScoped<ITasksRepository, TasksRepository>();
builder.Services.AddScoped<IMusicRepository, MusicRepository>();
builder.Services.AddScoped<IMoviesRepository, MoviesRepository>();
builder.Services.AddScoped<IArticleRepository, ArticleRepository>();
builder.Services.AddScoped<IAphorismsRepository, AphorismsRepository>();
builder.Services.AddScoped<IAffirmationRepository, AffirmationRepository>();
builder.Services.AddScoped<IDailyContentRepository, DailyContentRepository>();
builder.Services.AddScoped<IWeeklyQuestionAnswerRepository, WeeklyQuestionAnswerRepository>();
builder.Services.AddScoped<IUserProgressRepository, UserProgressRepository>();
builder.Services.AddScoped<IApiLogRepository, ApiLogRepository>();

// Add Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserSeriesAccessService, UserSeriesAccessService>();
builder.Services.AddScoped<IAnswersService, AnswersService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<INotesService, NotesService>();
builder.Services.AddScoped<IFavoritesService, FavoritesService>();
builder.Services.AddScoped<IPodcastEpisodesService, PodcastEpisodesService>();
builder.Services.AddScoped<IPodcastSeriesService, PodcastSeriesService>();
builder.Services.AddScoped<IWeeklyService, WeeklyService>();
builder.Services.AddScoped<IWeeklyQuestionService, WeeklyQuestionService>();
builder.Services.AddScoped<ITasksService, TasksService>();
builder.Services.AddScoped<IMusicService, MusicService>();
builder.Services.AddScoped<IMoviesService, MoviesService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<IAphorismsService, AphorismsService>();
builder.Services.AddScoped<IAffirmationsService, AffirmationService>();
builder.Services.AddScoped<IDailyContentService, DailyContentService>();
builder.Services.AddScoped<IWeeklyQuestionAnswerService, WeeklyQuestionAnswerService>();
builder.Services.AddScoped<IUserProgressService, UserProgressService>();
builder.Services.AddScoped<ICdnUploadService, CdnUploadService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins(
                "http://localhost:5173", 
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173",
                "https://app.keciyibesle.com", 
                "https://www.keciyibesle.com", 
                "https://keciyibesle.com",
                "http://app.keciyibesle.com", 
                "http://www.keciyibesle.com",
                "http://keciyibesle.com"
            )
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configure static files
app.UseStaticFiles();

// CORS must be configured before HTTPS redirection
app.UseCors("AllowAll");

// Only use HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

// Request logging middleware - logs all API requests to database
app.UseRequestLogging();

app.MapControllers();

try
{
    Log.Information("Starting KeciApp API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
