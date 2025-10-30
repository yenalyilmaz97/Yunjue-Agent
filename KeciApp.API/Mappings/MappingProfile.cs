using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;

namespace KeciApp.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        //Aphorism Mappings
        CreateMap<Aphorisms, AphorismResponseDTO>();

        //Affirmation Mappings
        CreateMap<Affirmations, AffirmationResponseDTO>();

        // Podcast Mappings
        CreateMap<PodcastSeries, PodcastSeriesResponseDTO>()
            .ForMember(dest => dest.IsVideo, opt => opt.MapFrom(src => src.isVideo))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.isActive));

        CreateMap<PodcastEpisodes, PodcastEpisodeResponseDTO>()
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastSeries.Title))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.isActive));

        CreateMap<Favorites, FavoriteResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.PodcastEpisode.Title))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastEpisode.PodcastSeries.Title));

        CreateMap<Notes, NoteResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.PodcastEpisode.Title))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.PodcastEpisode.PodcastSeries.Title));

        CreateMap<Questions, QuestionResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.EpisodeTitle, opt => opt.MapFrom(src => src.Episodes.Title))
            .ForMember(dest => dest.SeriesTitle, opt => opt.MapFrom(src => src.Episodes.PodcastSeries.Title))
            .ForMember(dest => dest.IsAnswered, opt => opt.MapFrom(src => src.isAnswered));

        CreateMap<Answers, AnswerResponseDTO>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question.QuestionText));

        // Weekly Content Mappings
        CreateMap<WeeklyContent, WeeklyContentResponseDTO>();

        // Content Mappings
        CreateMap<Movie, MovieResponseDTO>();
        CreateMap<Music, MusicResponseDTO>();

        CreateMap<WeeklyTask, TaskResponseDTO>()
            .ForMember(dest => dest.TaskDescription, opt => opt.MapFrom(src => src.TaskDescription));

        CreateMap<WeeklyQuestion, WeeklyQuestionResponseDTO>();

        // Articles
        CreateMap<Article, ArticleResponseDTO>()
            .ForMember(dest => dest.AuthorUserName, opt => opt.MapFrom(src => src.Author.UserName));
        CreateMap<CreateArticleRequest, Article>();
        CreateMap<EditArticleRequest, Article>();

        // User Mappings 
        CreateMap<User, UserResponseDTO>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.RoleName));

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
        CreateMap<CretaeAphorismRequest, Aphorisms>();
        CreateMap<EditAphorismRequest, Aphorisms>();

        CreateMap<CreateAffirmationRequest, Affirmations>();
        CreateMap<EditAffirmationRequest, Affirmations>();

        CreateMap<CreatePodcastSeriesRequest, PodcastSeries>();
        CreateMap<EditPodcastSeriesRequest, PodcastSeries>();

        CreateMap<CreatePodcastEpisodeRequest, PodcastEpisodes>()
            .ForMember(dest => dest.isActive, opt => opt.MapFrom(src => src.IsActive));

        CreateMap<EditPodcastEpisodeRequest, PodcastEpisodes>()
            .ForMember(dest => dest.isActive, opt => opt.MapFrom(src => src.IsActive));

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
