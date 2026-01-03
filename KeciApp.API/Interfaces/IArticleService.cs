using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IArticleService
{
    Task<IEnumerable<ArticleResponseDTO>> GetAllArticlesAsync(bool onlyActive = true);
    Task<ArticleResponseDTO> GetArticleByIdAsync(int articleId);
    Task<ArticleResponseDTO> AddArticleAsync(CreateArticleRequest request);
    Task<ArticleResponseDTO> EditArticleAsync(EditArticleRequest request);
    Task<ArticleResponseDTO> DeleteArticleAsync(int articleId);
    Task EnsureArticleOrdersAsync();
}
