using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IArticleRepository
{
    Task<IEnumerable<Article>> GetAllArticlesAsync(bool onlyPublished = true);
    Task<Article?> GetArticleByIdAsync(int articleId);
    Task<Article?> GetArticleBySlugAsync(string slug);
    Task<Article> CreateArticleAsync(Article article);
    Task<Article> UpdateArticleAsync(Article article);
    Task RemoveArticleAsync(Article article);
}
