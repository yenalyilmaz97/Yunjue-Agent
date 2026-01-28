using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public class UserUpdateDetail
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty; // e.g. "Order 1 -> 2"
}

public interface IContentUpdateBatchService
{
    Task LogBatchAsync(string updateType, List<UserUpdateDetail> updates, string? description = null);
    Task<byte[]> GeneratePdfForBatchAsync(Guid batchId);
    Task<IEnumerable<ContentUpdateBatch>> GetRecentBatchesAsync(int count = 10);
}
