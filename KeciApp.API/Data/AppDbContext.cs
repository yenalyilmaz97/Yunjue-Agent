using Microsoft.EntityFrameworkCore;
using KeciApp.API.Models;

namespace KeciApp.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSet properties for all entities
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<PodcastSeries> PodcastSeries { get; set; }
    public DbSet<PodcastEpisodes> PodcastEpisodes { get; set; }
    public DbSet<Questions> Questions { get; set; }
    public DbSet<Answers> Answers { get; set; }
    public DbSet<Notes> Notes { get; set; }
    public DbSet<Favorites> Favorites { get; set; }
    public DbSet<UserSeriesAccess> UserSeriesAccesses { get; set; }
    public DbSet<WeeklyContent> WeeklyContents { get; set; }
    public DbSet<Music> Musics { get; set; }
    public DbSet<Movie> Movies { get; set; }
    public DbSet<WeeklyTask> Tasks { get; set; }
    public DbSet<WeeklyQuestion> WeeklyQuestions { get; set; }
    public DbSet<WeeklyQuestionAnswer> WeeklyQuestionAnswers { get; set; }
    public DbSet<Aphorisms> Aphorisms { get; set; }
    public DbSet<Affirmations> Affirmations { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<DailyContent> DailyContents { get; set; }
    public DbSet<UserProgress> UserProgresses { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<ApiLog> ApiLogs { get; set; }
    public DbSet<ContentUpdateBatch> ContentUpdateBatches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.UserName).HasMaxLength(25).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(25).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(25).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(60).IsRequired();
            entity.Property(e => e.City).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Phone).IsRequired();
            entity.Property(e => e.Gender).IsRequired();
            entity.Property(e => e.DateOfBirth).IsRequired();
            entity.Property(e => e.SubscriptionEnd).IsRequired();
            entity.Property(e => e.WeeklyContentId).IsRequired();
            entity.Property(e => e.RoleId).IsRequired();
        });

        // Role entity configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.RoleId);
            entity.Property(e => e.RoleName).IsRequired();
        });

        // PodcastSeries entity configuration
        modelBuilder.Entity<PodcastSeries>(entity =>
        {
            entity.ToTable("PodcastSeries");
            entity.HasKey(e => e.SeriesId);
            entity.Property(e => e.Title).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // PodcastEpisodes entity configuration
        modelBuilder.Entity<PodcastEpisodes>(entity =>
        {
            entity.ToTable("PodcastEpisodes");
            entity.HasKey(e => e.EpisodesId);
            entity.Property(e => e.SeriesId).IsRequired();
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.ContentJson).IsRequired();
            entity.Property(e => e.SequenceNumber).IsRequired();
            entity.Property(e => e.isActive).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Questions entity configuration
        modelBuilder.Entity<Questions>(entity =>
        {
            entity.ToTable("Questions");
            entity.HasKey(e => e.QuestionId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.QuestionText).IsRequired();
            entity.Property(e => e.isAnswered).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Answers entity configuration
        modelBuilder.Entity<Answers>(entity =>
        {
            entity.ToTable("Answers");
            entity.HasKey(e => e.AnswerId);
            entity.Property(e => e.QuestionId).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.AnswerText).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Notes entity configuration
        modelBuilder.Entity<Notes>(entity =>
        {
            entity.ToTable("Notes");
            entity.HasKey(e => e.NoteId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(100).IsRequired();
            entity.Property(e => e.NoteText).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // Favorites entity configuration
        modelBuilder.Entity<Favorites>(entity =>
        {
            entity.ToTable("Favorites");
            entity.HasKey(e => e.FavoriteId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.FavoriteType).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // UserSeriesAccess entity configuration
        modelBuilder.Entity<UserSeriesAccess>(entity =>
        {
            entity.ToTable("UserSeriesAccesses");
            entity.HasKey(e => e.UserSeriesAccessId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.CurrentAccessibleSequence).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();

            // Unique constraint: Access is defined by User and (Series OR Article)
            // Including ArticleId ensures uniqueness when SeriesId is null (provided DB treats NULLs as distinct or we want (User, Null, Article) unique)
            entity.HasIndex(e => new { e.UserId, e.SeriesId, e.ArticleId })
                .IsUnique();
        });


        // WeeklyContent entity configuration
        modelBuilder.Entity<WeeklyContent>(entity =>
        {
            entity.ToTable("WeeklyContents");
            entity.HasKey(e => e.WeekId);
            entity.Property(e => e.WeekOrder).IsRequired();
            entity.Property(e => e.MusicId).IsRequired();
            entity.Property(e => e.MovieId).IsRequired();
            entity.Property(e => e.TaskId).IsRequired();
            entity.Property(e => e.WeeklyQuestionId).IsRequired();
        });

        // Music entity configuration
        modelBuilder.Entity<Music>(entity =>
        {
            entity.ToTable("Musics");
            entity.HasKey(e => e.MusicId);
            entity.Property(e => e.MusicTitle).IsRequired();
            entity.Property(e => e.MusicURL).IsRequired();
        });

        // Movie entity configuration
        modelBuilder.Entity<Movie>(entity =>
        {
            entity.ToTable("Movies");
            entity.HasKey(e => e.MovieId);
            entity.Property(e => e.MovieTitle).IsRequired();
            entity.Property(e => e.ImageUrl).IsRequired(false);
        });

        // WeeklyTask entity configuration
        modelBuilder.Entity<WeeklyTask>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(e => e.TaskId);
            entity.Property(e => e.TaskDescription).IsRequired();
        });

        // WeeklyQuestion entity configuration
        modelBuilder.Entity<WeeklyQuestion>(entity =>
        {
            entity.ToTable("WeeklyQuestions");
            entity.HasKey(e => e.WeeklyQuestionId);
            entity.Property(e => e.WeeklyQuestionText).IsRequired();
        });

        // Aphorisms
        modelBuilder.Entity<Aphorisms>(entity =>
        {
            entity.ToTable("Aphorisms");
            entity.HasKey(e => e.AphorismId);
            entity.Property(e => e.Text).IsRequired();
        });

        //Affirmations
        modelBuilder.Entity<Affirmations>(entity =>
        {
            entity.ToTable("Affirmations");
            entity.HasKey(e => e.AffirmationId);
            entity.Property(e => e.Text).IsRequired();
        });

        // Articles
        modelBuilder.Entity<Article>(entity =>
        {
            entity.ToTable("Articles");
            entity.HasKey(e => e.ArticleId);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.PdfLink).IsRequired();
            entity.Property(e => e.isActive).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        // DailyContent entity configuration
        modelBuilder.Entity<DailyContent>(entity =>
        {
            entity.ToTable("DailyContent");
            entity.HasKey(e => e.DailyContentId);
            entity.Property(e => e.DayOrder).IsRequired();
            entity.Property(e => e.AffirmationId).IsRequired();
            entity.Property(e => e.AporismId).IsRequired();
        });

        // UserProgress entity configuration
        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.ToTable("UserProgress");
            entity.HasKey(e => e.UserProgressId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.isCompleted).IsRequired();
            entity.Property(e => e.CompleteTime).IsRequired();

            // Unique constraints to prevent duplicate progress records
            // Using partial unique indexes for nullable columns (PostgreSQL syntax)
            entity.HasIndex(e => new { e.UserId, e.WeekId })
                .IsUnique()
                .HasFilter("\"WeekId\" IS NOT NULL");

            entity.HasIndex(e => new { e.UserId, e.ArticleId })
                .IsUnique()
                .HasFilter("\"ArticleId\" IS NOT NULL");

            entity.HasIndex(e => new { e.UserId, e.DailyContentId })
                .IsUnique()
                .HasFilter("\"DailyContentId\" IS NOT NULL");

            entity.HasIndex(e => new { e.UserId, e.EpisodeId })
                .IsUnique()
                .HasFilter("\"EpisodeId\" IS NOT NULL");
        });

        // RefreshToken entity configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.RefreshTokenId);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Token).HasMaxLength(256).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();

            // Index for faster token lookups
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
        });

        // ContentUpdateBatch entity configuration
        modelBuilder.Entity<ContentUpdateBatch>(entity =>
        {
            entity.ToTable("ContentUpdateBatches");
            entity.HasKey(e => e.BatchId);
            entity.Property(e => e.UpdateType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.UpdateData).IsRequired(); // Stores JSON
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Relationships configuration
        ConfigureRelationships(modelBuilder);
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // User relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<User>()
            .HasOne(u => u.WeeklyContent)
            .WithMany()
            .HasForeignKey(u => u.WeeklyContentId);

        modelBuilder.Entity<User>()
            .HasOne(u => u.DailyContent)
            .WithMany()
            .HasForeignKey(u => u.DailyContentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Notes)
            .WithOne(n => n.User)
            .HasForeignKey(n => n.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Favorites)
            .WithOne(f => f.User)
            .HasForeignKey(f => f.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.UserSeriesAccesses)
            .WithOne(usa => usa.User)
            .HasForeignKey(usa => usa.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Questions)
            .WithOne(q => q.User)
            .HasForeignKey(q => q.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Answers)
            .WithOne(a => a.User)
            .HasForeignKey(a => a.UserId);

        // PodcastSeries relationships
        modelBuilder.Entity<PodcastSeries>()
            .HasMany(ps => ps.Episodes)
            .WithOne(pe => pe.PodcastSeries)
            .HasForeignKey(pe => pe.SeriesId)
            .OnDelete(DeleteBehavior.Cascade);

        // PodcastEpisodes relationships
        modelBuilder.Entity<PodcastEpisodes>()
            .HasMany(pe => pe.Questions)
            .WithOne(q => q.Episodes)
            .HasForeignKey(q => q.EpisodeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PodcastEpisodes>()
            .HasMany(pe => pe.Notes)
            .WithOne(n => n.PodcastEpisode)
            .HasForeignKey(n => n.EpisodeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PodcastEpisodes>()
            .HasMany(pe => pe.Favorites)
            .WithOne(f => f.PodcastEpisode)
            .HasForeignKey(f => f.EpisodeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Favorites relationships
        modelBuilder.Entity<Favorites>()
            .HasOne(f => f.Article)
            .WithMany()
            .HasForeignKey(f => f.ArticleId);

        modelBuilder.Entity<Favorites>()
            .HasOne(f => f.Affirmations)
            .WithMany()
            .HasForeignKey(f => f.AffirmationId);

        modelBuilder.Entity<Favorites>()
            .HasOne(f => f.Aphorisms)
            .WithMany()
            .HasForeignKey(f => f.AphorismId);

        // Questions relationships
        modelBuilder.Entity<Questions>()
            .HasMany(q => q.Answers)
            .WithOne(a => a.Question)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // UserSeriesAccess relationships
        modelBuilder.Entity<UserSeriesAccess>()
            .HasOne(usa => usa.PodcastSeries)
            .WithMany()
            .HasForeignKey(usa => usa.SeriesId)
            .OnDelete(DeleteBehavior.Cascade);

        // WeeklyContent relationships
        modelBuilder.Entity<WeeklyContent>()
            .HasOne(wc => wc.Music)
            .WithMany()
            .HasForeignKey(wc => wc.MusicId);

        modelBuilder.Entity<WeeklyContent>()
            .HasOne(wc => wc.Movie)
            .WithMany()
            .HasForeignKey(wc => wc.MovieId);

        modelBuilder.Entity<WeeklyContent>()
            .HasOne(wc => wc.Task)
            .WithMany()
            .HasForeignKey(wc => wc.TaskId);

        modelBuilder.Entity<WeeklyContent>()
            .HasOne(wc => wc.WeeklyQuestion)
            .WithMany()
            .HasForeignKey(wc => wc.WeeklyQuestionId);

        // DailyContent relationships
        modelBuilder.Entity<DailyContent>()
            .HasOne(dc => dc.Affirmations)
            .WithMany()
            .HasForeignKey(dc => dc.AffirmationId);

        modelBuilder.Entity<DailyContent>()
            .HasOne(dc => dc.Aphorisms)
            .WithMany()
            .HasForeignKey(dc => dc.AporismId);

        // UserProgress relationships
        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.User)
            .WithMany()
            .HasForeignKey(up => up.UserId);

        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.WeeklyContent)
            .WithMany()
            .HasForeignKey(up => up.WeekId);

        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.Article)
            .WithMany()
            .HasForeignKey(up => up.ArticleId);

        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.DailyContent)
            .WithMany()
            .HasForeignKey(up => up.DailyContentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.PodcastEpisodes)
            .WithMany()
            .HasForeignKey(up => up.EpisodeId)
            .OnDelete(DeleteBehavior.Cascade);

        // RefreshToken relationships
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
