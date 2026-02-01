using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;

public class ContentUpdateBatchRepository : IContentUpdateBatchRepository
{
    private readonly AppDbContext _context;

    public ContentUpdateBatchRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ContentUpdateBatch> CreateBatchAsync(ContentUpdateBatch batch)
    {
        _context.ContentUpdateBatches.Add(batch);
        await _context.SaveChangesAsync();
        return batch;
    }

    public async Task<ContentUpdateBatch?> GetBatchByIdAsync(Guid batchId)
    {
        return await _context.ContentUpdateBatches
            .FirstOrDefaultAsync(b => b.BatchId == batchId);
    }

    public async Task<IEnumerable<ContentUpdateBatch>> GetRecentBatchesAsync(int count)
    {
        return await _context.ContentUpdateBatches
            .OrderByDescending(b => b.CreatedAt)
            .Take(count)
            .ToListAsync();
    }
}
