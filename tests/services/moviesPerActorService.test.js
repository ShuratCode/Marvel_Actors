import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MoviesPerActorService } from '../../src/services/moviesPerActorService.js';

describe('MoviesPerActorService', () => {
  let service;
  let mockTmdbClient;
  let mockCache;

  const mockMovies = {
    'Movie 1': 101,
    'Movie 2': 102,
  };

  const mockActors = ['Actor A', 'Actor B', 'Actor C'];

  beforeEach(() => {
    mockTmdbClient = {
      fetchMovieCredits: jest.fn(),
    };

    mockCache = {
      getOrSet: jest.fn(),
    };

    service = new MoviesPerActorService(mockTmdbClient, mockCache, mockMovies, mockActors, 5);
  });

  it('should map actors to their movies correctly including case insensitive matching', async () => {
    const movie1Credits = {
      cast: [
        { name: 'actor a', character: 'Char A' },
        { name: 'Actor B', character: 'Char B' },
      ],
    };
    const movie2Credits = {
      cast: [
        { name: 'ACTOR A', character: 'Char A2' },
      ],
    };

    mockCache.getOrSet.mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    });

    mockTmdbClient.fetchMovieCredits
      .mockResolvedValueOnce(movie1Credits)
      .mockResolvedValueOnce(movie2Credits);

    const result = await service.getMoviesPerActor();

    expect(result).toEqual({
      'Actor A': ['Movie 1', 'Movie 2'],
      'Actor B': ['Movie 1'],
      'Actor C': [],
    });

    expect(mockTmdbClient.fetchMovieCredits).toHaveBeenCalledWith(101);
    expect(mockTmdbClient.fetchMovieCredits).toHaveBeenCalledWith(102);
    expect(mockCache.getOrSet).toHaveBeenCalledTimes(2);
  });

  it('should use cache for fetching credits', async () => {
    mockCache.getOrSet.mockImplementation(async (key, fetchFn) => {
      if (key === 'movie_credits_101') {
        return {
           cast: [{ name: 'Actor A' }] 
        };
      }
      return await fetchFn();
    });
    
    mockTmdbClient.fetchMovieCredits.mockResolvedValue({ cast: [] });

    await service.getMoviesPerActor();

    expect(mockCache.getOrSet).toHaveBeenCalledWith('movie_credits_101', expect.any(Function));
    expect(mockCache.getOrSet).toHaveBeenCalledWith('movie_credits_102', expect.any(Function));
  });

  it('should fail completely if one request fails', async () => {
     mockCache.getOrSet.mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    });
    
    mockTmdbClient.fetchMovieCredits
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({ cast: [{ name: 'Actor A' }] });

    await expect(service.getMoviesPerActor()).rejects.toThrow('API Error');
  });
});
