using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;

namespace KeciApp.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        //Aphorism Mappings
        CreateMap<Aphorisms, AphorismResponseDTO>()
            .ForMember(dest => dest.AphorismText, opt => opt.MapFrom(src => src.Text));

        //Affirmation Mappings
        CreateMap<Affirmations, AffirmationResponseDTO>()
            .ForMember(dest => dest.AffirmationText, opt => opt.MapFrom(src => src.Text));

        // Podcast Mappings
        CreateMap<PodcastSeries, PodcastSeriesResponseDTO>()
            .ForMember(dest => dest.IsVideo, opt => opt.MapFrom(src => src.isVideo))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.isActive));

        CreateMap<PodcastEpisodes, PodcastEpisodeResponseDTO>()
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastSeries.Title))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.isActive))
            .ForMember(dest => dest.Content, opt => opt.Ignore()); // Content will be deserialized in service

        CreateMap<Favorites, FavoriteResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : string.Empty))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.PodcastEpisode != null ? src.PodcastEpisode.Title : null))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastEpisode != null && src.PodcastEpisode.PodcastSeries != null ? src.PodcastEpisode.PodcastSeries.Title : null))
            .ForMember(dest => dest.ArticleTitle, opt => opt.MapFrom(src => src.Article != null ? src.Article.Title : null))
            .ForMember(dest => dest.AffirmationText, opt => opt.MapFrom(src => src.Affirmations != null ? src.Affirmations.Text : null))
            .ForMember(dest => dest.AphorismText, opt => opt.MapFrom(src => src.Aphorisms != null ? src.Aphorisms.Text : null));

        CreateMap<Notes, NoteResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : string.Empty))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.PodcastEpisode != null ? src.PodcastEpisode.Title : null))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastEpisode != null && src.PodcastEpisode.PodcastSeries != null ? src.PodcastEpisode.PodcastSeries.Title : null));

        CreateMap<Questions, QuestionResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : string.Empty))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.Episodes != null ? src.Episodes.Title : null))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.Episodes != null && src.Episodes.PodcastSeries != null ? src.Episodes.PodcastSeries.Title : null))
            .ForMember(dest => dest.IsAnswered, opt => opt.MapFrom(src => src.isAnswered));

        CreateMap<Answers, AnswerResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : string.Empty))
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question != null ? src.Question.QuestionText : string.Empty));

        // Weekly Content Mappings
        CreateMap<WeeklyContent, WeeklyContentResponseDTO>();

        // Content Mappings
        CreateMap<Movie, MovieResponseDTO>();
        CreateMap<Music, MusicResponseDTO>();

        CreateMap<WeeklyTask, TaskResponseDTO>()
            .ForMember(dest => dest.TaskDescription, opt => opt.MapFrom(src => src.TaskDescription));

        CreateMap<WeeklyQuestion, WeeklyQuestionResponseDTO>();

        // DailyContent Mappings
        CreateMap<DailyContent, DailyContentResponseDTO>();
        CreateMap<CreateDailyContentRequest, DailyContent>();
        CreateMap<UpdateDailyContentRequest, DailyContent>();

        // WeeklyQuestionAnswer Mappings
        CreateMap<WeeklyQuestionAnswer, WeeklyQuestionAnswerResponseDTO>();
        CreateMap<AnswerWeeklyQuestionRequest, WeeklyQuestionAnswer>();
        CreateMap<UpdateWeeklyQuestionAnswerRequest, WeeklyQuestionAnswer>();

        // Articles
        CreateMap<Article, ArticleResponseDTO>();
        CreateMap<CreateArticleRequest, Article>();
        CreateMap<EditArticleRequest, Article>();

        // User Mappings 
        CreateMap<User, UserResponseDTO>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.RoleName : string.Empty));

        // Map User to AuthResponse UserInfo (for login/register)
        CreateMap<User, UserInfo>();

        CreateMap<Role, RoleResponseDTO>();

        // User Request to Entity Mappings
        CreateMap<CreateUserRequest, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Will be hashed in service
            .ForMember(dest => dest.WeeklyContentId, opt => opt.MapFrom(src => 1)) // Default weekly content
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<EditUserRequest, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.WeeklyContentId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        // Role Request to Entity Mappings
        CreateMap<CreateRoleRequest, Role>();
        CreateMap<EditRoleRequest, Role>();

        // Request to Entity Mappings
        CreateMap<CretaeAphorismRequest, Aphorisms>()
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.AphorismText));
        CreateMap<EditAphorismRequest, Aphorisms>()
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.AphorismText));

        CreateMap<CreateAffirmationRequest, Affirmations>()
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.AffirmationText));
        CreateMap<EditAffirmationRequest, Affirmations>()
            .ForMember(dest => dest.Text, opt => opt.MapFrom(src => src.AffirmationText));

        CreateMap<CreatePodcastSeriesRequest, PodcastSeries>();
        CreateMap<EditPodcastSeriesRequest, PodcastSeries>();

        CreateMap<CreatePodcastEpisodeRequest, PodcastEpisodes>()
            .ForMember(dest => dest.isActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.ContentJson, opt => opt.Ignore()) // ContentJson will be set in service
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.SequenceNumber, opt => opt.Ignore());

        CreateMap<EditPodcastEpisodeRequest, PodcastEpisodes>()
            .ForMember(dest => dest.isActive, opt => opt.MapFrom(src => src.IsActive))
            .ForMember(dest => dest.ContentJson, opt => opt.Ignore()) // ContentJson will be set in service
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.EpisodesId, opt => opt.MapFrom(src => src.EpisodeId));

        CreateMap<CreateWeeklyContentRequest, WeeklyContent>();
        
        // Content Request to Entity Mappings
        CreateMap<CreateMovieRequest, Movie>();
        CreateMap<EditMovieRequest, Movie>();
        
        CreateMap<CreateMusicRequest, Music>();
        CreateMap<EditMusicRequest, Music>();
        
        CreateMap<CreateTaskRequest, WeeklyTask>();
        CreateMap<EditTaskRequest, WeeklyTask>();
        
        CreateMap<CreateWeeklyQuestionRequest, WeeklyQuestion>();
        CreateMap<EditWeeklyQuestionRequest, WeeklyQuestion>();
        CreateMap<EditWeeklyContentRequest, WeeklyContent>();

        CreateMap<CreateMovieRequest, Movie>();
        CreateMap<EditMovieRequest, Movie>();

        CreateMap<CreateMusicRequest, Music>();
        CreateMap<EditMusicRequest, Music>();

        CreateMap<CreateTaskRequest, WeeklyTask>()
            .ForMember(dest => dest.TaskDescription, opt => opt.MapFrom(src => src.TaskDescription));

        CreateMap<EditTaskRequest, WeeklyTask>()
            .ForMember(dest => dest.TaskDescription, opt => opt.MapFrom(src => src.TaskDescription));

        CreateMap<CreateWeeklyQuestionRequest, WeeklyQuestion>();
        CreateMap<EditWeeklyQuestionRequest, WeeklyQuestion>();

        CreateMap<AddNoteRequest, Notes>();

        CreateMap<AddQuestionRequest, Questions>();

        CreateMap<AnswerQuestionRequest, Answers>()
            .ForMember(dest => dest.AnswerText, opt => opt.MapFrom(src => src.Answer));

        // UserSeriesAccess Mappings
        CreateMap<UserSeriesAccess, UserSeriesAccessResponseDTO>();
        CreateMap<CreateUserSeriesAccessRequest, UserSeriesAccess>()
            .ForMember(dest => dest.UserSeriesAccessId, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
        CreateMap<GrantAccessRequest, UserSeriesAccess>()
            .ForMember(dest => dest.UserSeriesAccessId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.PodcastSeries, opt => opt.Ignore());

    }
}
