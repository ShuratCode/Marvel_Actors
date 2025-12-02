import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ActorsMultipleCharactersService } from '../../src/services/actorsMultipleCharactersService.js';

describe('ActorsMultipleCharactersService', () => {
  let service;
  let mockTmdbClient;
  let mockCache;

  const mockMovies = {
    'Movie 1': 101,
    'Movie 2': 102,
  };

  beforeEach(() => {
    mockTmdbClient = {
      fetchMovieCredits: jest.fn(),
    };

    mockCache = {
      getOrSet: jest.fn(),
    };

    service = new ActorsMultipleCharactersService(mockTmdbClient, mockCache, mockMovies);
  });

  it('should identify actors with multiple different characters', async () => {
    const movie1Credits = {
      cast: [
        { name: 'Chris Evans', character: 'Human Torch' },
        { name: 'Robert Downey Jr.', character: 'Tony Stark' },
      ],
    };
    const movie2Credits = {
      cast: [
        { name: 'Chris Evans', character: 'Captain America' },
        { name: 'Robert Downey Jr.', character: 'Tony Stark' },
      ],
    };

    mockCache.getOrSet.mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    });

    mockTmdbClient.fetchMovieCredits
      .mockResolvedValueOnce(movie1Credits)
      .mockResolvedValueOnce(movie2Credits);

    const result = await service.getActorsWithMultipleCharacters();
    
    expect(result['Chris Evans']).toBeDefined();
    expect(result['Chris Evans']).toHaveLength(2);
    expect(result['Chris Evans']).toEqual(expect.arrayContaining([
      { movieName: 'Movie 1', characterName: 'Human Torch' },
      { movieName: 'Movie 2', characterName: 'Captain America' }
    ]));

    expect(result['Robert Downey Jr.']).toBeUndefined();
  });

  it('should return empty object if no actors play multiple characters', async () => {
    const movie1Credits = {
      cast: [{ name: 'Actor A', character: 'Char A' }],
    };
    const movie2Credits = {
      cast: [{ name: 'Actor B', character: 'Char B' }],
    };

    mockCache.getOrSet.mockImplementation(async (k, fn) => fn());
    mockTmdbClient.fetchMovieCredits
        .mockResolvedValueOnce(movie1Credits)
        .mockResolvedValueOnce(movie2Credits);

    const result = await service.getActorsWithMultipleCharacters();

    expect(result).toEqual({});
  });

  it('should fail completely if one request fails', async () => {
    mockCache.getOrSet.mockImplementation(async (k, fn) => fn());
    mockTmdbClient.fetchMovieCredits.mockRejectedValue(new Error('API Error'));

    await expect(service.getActorsWithMultipleCharacters()).rejects.toThrow('API Error');
  });
  
  it('should ignore case for actor names but preserve character names', async () => {
      const movie1Credits = {
        cast: [{ name: 'actor a', character: 'Char 1' }],
      };
      const movie2Credits = {
        cast: [{ name: 'ACTOR A', character: 'Char 2' }],
      };
  
      mockCache.getOrSet.mockImplementation(async (k, fn) => fn());
      mockTmdbClient.fetchMovieCredits
          .mockResolvedValueOnce(movie1Credits)
          .mockResolvedValueOnce(movie2Credits);
  
      const result = await service.getActorsWithMultipleCharacters();
  
      const keys = Object.keys(result);
      expect(keys).toHaveLength(1);

      expect(result[keys[0]]).toEqual(expect.arrayContaining([
          { movieName: 'Movie 1', characterName: 'Char 1' },
          { movieName: 'Movie 2', characterName: 'Char 2' }
      ]));
  });
});
