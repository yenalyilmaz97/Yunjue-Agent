using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IMoviesService
{
    Task<IEnumerable<MovieResponseDTO>> GetAllMoviesAsync();
    Task<MovieResponseDTO> GetMovieByIdAsync(int movieId);
    Task<MovieResponseDTO> AddMovieAsync(CreateMovieRequest request);
    Task<MovieResponseDTO> EditMovieAsync(EditMovieRequest request);
    Task<MovieResponseDTO> DeleteMovieAsync(int movieId);

}
