using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class MoviesRepository : IMoviesRepository
{
    private readonly AppDbContext _context;

    public MoviesRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Movie>> GetAllMoviesAsync()
    {
        return await _context.Movies.OrderBy(m => m.order).ToListAsync();
    }
    public async Task<int> GetMaxMovieOrderAsync()
    {
        return await _context.Movies.MaxAsync(m => m.order);
    }
    public async Task<int> GetMovieIdByOrderAsync(int order)
    {
        return await _context.Movies
            .Where(m => m.order == order)
            .Select(m => m.MovieId)
            .FirstOrDefaultAsync();
    }
    public async Task<Movie?> GetMovieByIdAsync(int movieId)
    {
        return await _context.Movies.FindAsync(movieId);
    }
    public async Task<Movie> CreateMovieAsync(Movie movie)
    {
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        return movie;
    }
    public async Task<Movie> UpdateMovieAsync(Movie movie)
    {
        _context.Movies.Update(movie);
        await _context.SaveChangesAsync();
        return movie;
    }
    public async Task RemoveMovieAsync(Movie movie)
    {
        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
    }
}
