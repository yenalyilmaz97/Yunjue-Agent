using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services
{
    public class MoviesService : IMoviesService
    {
        private readonly IMoviesRepository _moviesRepository;
        private readonly IMapper _mapper;
        private readonly IFileUploadService _fileUploadService;

        public MoviesService(IMoviesRepository moviesRepository, IMapper mapper, IFileUploadService fileUploadService)
        {
            _moviesRepository = moviesRepository;
            _mapper = mapper;
            _fileUploadService = fileUploadService;
        }

        public async Task<IEnumerable<MovieResponseDTO>> GetAllMoviesAsync()
        {
            var movies = await _moviesRepository.GetAllMoviesAsync();
            return _mapper.Map<IEnumerable<MovieResponseDTO>>(movies);
        }

        public async Task<MovieResponseDTO> GetMovieByIdAsync(int movieId)
        {
            var movie = await _moviesRepository.GetMovieByIdAsync(movieId);
            if (movie == null)
            {
                throw new InvalidOperationException("Movie not found");
            }

            return _mapper.Map<MovieResponseDTO>(movie);
        }

        public async Task<MovieResponseDTO> AddMovieAsync(CreateMovieRequest request)
        {
            var movie = _mapper.Map<Movie>(request);
            var maxOrder = await _moviesRepository.GetMaxMovieOrderAsync();
            movie.order = maxOrder + 1;
            var createdMovie = await _moviesRepository.CreateMovieAsync(movie);
            
            // Upload image if provided
            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                try
                {
                    string imageUrl = await _fileUploadService.UploadMovieImageAsync(
                        request.ImageFile, 
                        createdMovie.MovieTitle, 
                        createdMovie.MovieId
                    );
                    createdMovie.ImageUrl = imageUrl;
                    createdMovie = await _moviesRepository.UpdateMovieAsync(createdMovie);
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the movie creation
                    // Could add logging here if needed
                }
            }
            
            return _mapper.Map<MovieResponseDTO>(createdMovie);
        }

        public async Task<MovieResponseDTO> EditMovieAsync(EditMovieRequest request)
        {
            var movie = await _moviesRepository.GetMovieByIdAsync(request.MovieId);
            if (movie == null)
            {
                throw new InvalidOperationException("Movie not found");
            }

            _mapper.Map(request, movie);
            var updatedMovie = await _moviesRepository.UpdateMovieAsync(movie);
            return _mapper.Map<MovieResponseDTO>(updatedMovie);
        }

        public async Task<MovieResponseDTO> DeleteMovieAsync(int movieId)
        {
            var movie = await _moviesRepository.GetMovieByIdAsync(movieId);
            if (movie == null)
            {
                throw new InvalidOperationException("Movie not found");
            }

            await _moviesRepository.RemoveMovieAsync(movie);
            return _mapper.Map<MovieResponseDTO>(movie);
        }

        public async Task<MovieResponseDTO> UpdateMovieImageAsync(int movieId, string imageUrl)
        {
            var movie = await _moviesRepository.GetMovieByIdAsync(movieId);
            if (movie == null)
            {
                throw new InvalidOperationException("Movie not found");
            }

            // Delete old image folder if exists
            if (!string.IsNullOrWhiteSpace(movie.ImageUrl))
            {
                try
                {
                    // Delete the entire movie folder from CDN
                    await _fileUploadService.DeleteMovieImageFolderAsync(movieId, movie.MovieTitle);
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the update
                    // Could add logging here if needed
                }
            }

            // Update image URL
            movie.ImageUrl = imageUrl;
            var updatedMovie = await _moviesRepository.UpdateMovieAsync(movie);
            return _mapper.Map<MovieResponseDTO>(updatedMovie);
        }

        public async Task<MovieResponseDTO> DeleteMovieImageAsync(int movieId)
        {
            var movie = await _moviesRepository.GetMovieByIdAsync(movieId);
            if (movie == null)
            {
                throw new InvalidOperationException("Movie not found");
            }

            // Delete image folder from CDN
            if (!string.IsNullOrWhiteSpace(movie.ImageUrl))
            {
                try
                {
                    await _fileUploadService.DeleteMovieImageFolderAsync(movieId, movie.MovieTitle);
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the deletion
                    // Could add logging here if needed
                }
            }

            // Clear image URL
            movie.ImageUrl = null;
            var updatedMovie = await _moviesRepository.UpdateMovieAsync(movie);
            return _mapper.Map<MovieResponseDTO>(updatedMovie);
        }

    }
}
