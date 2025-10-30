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

        public MoviesService(IMoviesRepository moviesRepository, IMapper mapper)
        {
            _moviesRepository = moviesRepository;
            _mapper = mapper;
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

    }
}
