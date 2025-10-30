using System.Linq.Expressions;

namespace KeciApp.API.Interfaces;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);
    Task<T?> FindFirstOrDefaultAsync(Expression<Func<T, bool>> expression);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task DeleteByIdAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync();
    Task<int> CountAsync(Expression<Func<T, bool>> expression);
}
