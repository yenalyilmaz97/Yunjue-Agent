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
    public async Task<IEnumerable<ArticleResponseDTO>> GetAllArticlesAsync(bool onlyActive = true)
    {
        var articles = await _articleRepository.GetAllArticlesAsync(onlyActive);
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

    public async Task<ArticleResponseDTO> AddArticleAsync(CreateArticleRequest request)
    {
        var article = _mapper.Map<Article>(request);
        article.CreatedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;
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
        // Map fields explicitly to ensure updates persist
        article.Title = request.Title;
        article.PdfLink = request.PdfLink;
        article.isActive = request.isActive;
        article.UpdatedAt = DateTime.UtcNow;
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
}
