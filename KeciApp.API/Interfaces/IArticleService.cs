using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IArticleService
{
    Task<IEnumerable<ArticleResponseDTO>> GetAllArticlesAsync(bool onlyPublished = true);
    Task<ArticleResponseDTO> GetArticleByIdAsync(int articleId);
    Task<ArticleResponseDTO> GetArticleBySlugAsync(string slug);
    Task<ArticleResponseDTO> AddArticleAsync(CreateArticleRequest request, int authorId);
    Task<ArticleResponseDTO> EditArticleAsync(EditArticleRequest request);
    Task<ArticleResponseDTO> DeleteArticleAsync(int articleId);
    Task<ArticleResponseDTO> SetArticleCoverAsync(int articleId, string coverUrl);
}
