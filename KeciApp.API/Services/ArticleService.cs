using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class ArticleService : IArticleService
{
    private readonly IArticleRepository _articleRepository;
    private readonly IMapper _mapper;

    public ArticleService(IArticleRepository articleRepository, IMapper mapper)
    {
        _articleRepository = articleRepository;
        _mapper = mapper;
    }
    public async Task<IEnumerable<ArticleResponseDTO>> GetAllArticlesAsync(bool onlyPublished = true)
    {
        var articles = await _articleRepository.GetAllArticlesAsync(onlyPublished);
        return _mapper.Map<IEnumerable<ArticleResponseDTO>>(articles);
    }

    public async Task<ArticleResponseDTO> GetArticleByIdAsync(int articleId)
    {
        var article = await _articleRepository.GetArticleByIdAsync(articleId);
        if (article == null)
        {
            throw new InvalidOperationException("Article not found");
        }
        return _mapper.Map<ArticleResponseDTO>(article);
    }

    public async Task<ArticleResponseDTO> GetArticleBySlugAsync(string slug)
    {
        var article = await _articleRepository.GetArticleBySlugAsync(slug);
        if (article == null)
        {
            throw new InvalidOperationException("Article not found");
        }
        return _mapper.Map<ArticleResponseDTO>(article);
    }

    public async Task<ArticleResponseDTO> AddArticleAsync(CreateArticleRequest request, int authorId)
    {
        var article = _mapper.Map<Article>(request);
        article.AuthorId = authorId;
        article.Slug = GenerateSlug(request.Title);
        article.CreatedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;
        if (article.IsPublished && article.PublishedAt == null)
        {
            article.PublishedAt = DateTime.UtcNow;
        }
        var created = await _articleRepository.CreateArticleAsync(article);
        return _mapper.Map<ArticleResponseDTO>(created);
    }

    public async Task<ArticleResponseDTO> EditArticleAsync(EditArticleRequest request)
    {
        var article = await _articleRepository.GetArticleByIdAsync(request.ArticleId);
        if (article == null)
        {
            throw new InvalidOperationException("Article not found");
        }
        var wasPublished = article.IsPublished;
        // Map fields explicitly to ensure updates persist
        article.Title = request.Title;
        article.Excerpt = request.Excerpt;
        article.ContentHtml = request.ContentHtml;
        article.CoverImageUrl = request.CoverImageUrl;
        article.IsPublished = request.IsPublished;
        article.Slug = GenerateSlug(article.Title);
        article.UpdatedAt = DateTime.UtcNow;
        if (article.IsPublished && !wasPublished && article.PublishedAt == null)
        {
            article.PublishedAt = DateTime.UtcNow;
        }
        var updated = await _articleRepository.UpdateArticleAsync(article);
        return _mapper.Map<ArticleResponseDTO>(updated);
    }

    public async Task<ArticleResponseDTO> DeleteArticleAsync(int articleId)
    {
        var article = await _articleRepository.GetArticleByIdAsync(articleId);
        if (article == null)
        {
            throw new InvalidOperationException("Article not found");
        }
        await _articleRepository.RemoveArticleAsync(article);
        return _mapper.Map<ArticleResponseDTO>(article);
    }

    public async Task<ArticleResponseDTO> SetArticleCoverAsync(int articleId, string coverUrl)
    {
        var article = await _articleRepository.GetArticleByIdAsync(articleId);
        if (article == null)
        {
            throw new InvalidOperationException("Article not found");
        }
        article.CoverImageUrl = coverUrl;
        article.UpdatedAt = DateTime.UtcNow;
        var updated = await _articleRepository.UpdateArticleAsync(article);
        return _mapper.Map<ArticleResponseDTO>(updated);
    }

    private static string GenerateSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return Guid.NewGuid().ToString("n");
        var slug = new string(title
            .ToLowerInvariant()
            .Normalize(System.Text.NormalizationForm.FormD)
            .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            .ToArray());
        slug = new string(slug.Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray());
        slug = System.Text.RegularExpressions.Regex.Replace(slug, "-+", "-").Trim('-');
        if (string.IsNullOrWhiteSpace(slug)) slug = Guid.NewGuid().ToString("n");
        return slug;
    }
}
