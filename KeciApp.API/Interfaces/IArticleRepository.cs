using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IArticleRepository
{
    Task<IEnumerable<Article>> GetAllArticlesAsync(bool onlyActive = true);
    Task<Article?> GetArticleByIdAsync(int articleId);
    Task<Article> CreateArticleAsync(Article article);
    Task<Article> UpdateArticleAsync(Article article);
    Task RemoveArticleAsync(Article article);
    Task<Article?> GetArticleByOrderAsync(int order);
}
