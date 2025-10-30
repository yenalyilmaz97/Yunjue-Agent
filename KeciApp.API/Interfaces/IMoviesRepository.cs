using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IMoviesRepository
{
    Task<IEnumerable<Movie>> GetAllMoviesAsync();
    Task<Movie?> GetMovieByIdAsync(int movieId);
    Task<Movie> CreateMovieAsync(Movie movie);
    Task<Movie> UpdateMovieAsync(Movie movie);
    Task RemoveMovieAsync(Movie movie);
    Task<int> GetMaxMovieOrderAsync();
    Task<int> GetMovieIdByOrderAsync(int order);
}
