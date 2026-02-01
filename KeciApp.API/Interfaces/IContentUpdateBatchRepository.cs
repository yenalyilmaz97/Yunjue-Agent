using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IContentUpdateBatchRepository
{
    Task<ContentUpdateBatch> CreateBatchAsync(ContentUpdateBatch batch);
    Task<ContentUpdateBatch?> GetBatchByIdAsync(Guid batchId);
    Task<IEnumerable<ContentUpdateBatch>> GetRecentBatchesAsync(int count);
}
