using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using Microsoft.Extensions.Logging;

namespace KeciApp.API.Services;
public class ArticleService : IArticleService
{
    private readonly IArticleRepository _articleRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICdnUploadService _cdnUploadService;
    private readonly IMapper _mapper;
    private readonly ILogger<ArticleService> _logger;

    public ArticleService(
        IArticleRepository articleRepository, 
        IFileUploadService fileUploadService,
        ICdnUploadService cdnUploadService,
        IMapper mapper,
        ILogger<ArticleService> logger)
    {
        _articleRepository = articleRepository;
        _fileUploadService = fileUploadService;
        _cdnUploadService = cdnUploadService;
        _mapper = mapper;
        _logger = logger;
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

        // Generate slug for folder deletion
        string titleSlug = _fileUploadService.GenerateSlug(article.Title);

        // Delete PDF file from CDN before removing article
        if (!string.IsNullOrWhiteSpace(article.PdfLink))
        {
            try
            {
                await _fileUploadService.DeleteFileAsync(article.PdfLink);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting PDF file for article {ArticleId}. Article will still be removed from database.", articleId);
                // Continue with article deletion even if file deletion fails
            }
        }

        // Delete article folder from CDN (article/{titleSlug}/)
        if (!string.IsNullOrWhiteSpace(titleSlug))
        {
            try
            {
                string articleFolderPath = $"article/{titleSlug}";
                await _cdnUploadService.DeleteDirectoryAsync(articleFolderPath);
            }
            catch (Exception folderEx)
            {
                _logger.LogError(folderEx, "Error deleting article folder for article {ArticleId}", articleId);
                // Continue with article deletion even if folder deletion fails
            }
        }

        await _articleRepository.RemoveArticleAsync(article);
        return _mapper.Map<ArticleResponseDTO>(article);
    }
}
