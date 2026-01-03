using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Models;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Repositories;
public class ArticleRepository : IArticleRepository
{
    private readonly AppDbContext _context;
    public ArticleRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Article>> GetAllArticlesAsync(bool onlyActive = true)
    {
        var query = _context.Articles.AsQueryable();
        if (onlyActive)
        {
            query = query.Where(a => a.isActive);
        }
        return await query
            .OrderBy(a => a.Order)
            .ToListAsync();
    }

    public async Task<Article?> GetArticleByOrderAsync(int order)
    {
        return await _context.Articles
            .FirstOrDefaultAsync(a => a.Order == order);
    }

    public async Task<Article?> GetArticleByIdAsync(int articleId)
    {
        return await _context.Articles
            .FirstOrDefaultAsync(a => a.ArticleId == articleId);
    }

    public async Task<Article> CreateArticleAsync(Article article)
    {
        var maxOrder = await _context.Articles.MaxAsync(a => (int?)a.Order) ?? 0;
        article.Order = maxOrder + 1;

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();
        return article;
    }

    public async Task<Article> UpdateArticleAsync(Article article)
    {
        _context.Articles.Update(article);
        await _context.SaveChangesAsync();
        return article;
    }

    public async Task RemoveArticleAsync(Article article)
    {
        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();
    }

}
