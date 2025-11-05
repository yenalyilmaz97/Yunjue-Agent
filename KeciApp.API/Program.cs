using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Services;
using KeciApp.API.Repositories;
using KeciApp.API.Mappings;
using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

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
                "https://www.keciyibesle.com", 
                "https://keciyibesle.com",
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

app.MapControllers();

app.Run();
