import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CharactersWithMultipleActorsService } from '../../src/services/charactersWithMultipleActorsService.js';

describe('CharactersWithMultipleActorsService', () => {
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

    service = new CharactersWithMultipleActorsService(mockTmdbClient, mockCache, mockMovies);
  });

  it('should identify characters played by multiple different actors', async () => {
    const movie1Credits = {
      cast: [
        { name: 'Edward Norton', character: 'Bruce Banner / The Hulk' },
      ],
    };
    const movie2Credits = {
      cast: [
        { name: 'Mark Ruffalo', character: 'Bruce Banner / The Hulk' },
      ],
    };

    mockCache.getOrSet.mockImplementation(async (key, fetchFn) => {
      return await fetchFn();
    });

    mockTmdbClient.fetchMovieCredits
      .mockResolvedValueOnce(movie1Credits)
      .mockResolvedValueOnce(movie2Credits);

    const result = await service.getCharactersWithMultipleActors();
    
    expect(result).toEqual([
      {
        characterName: 'Bruce Banner / The Hulk',
        actors: ['Edward Norton', 'Mark Ruffalo'],
      },
    ]);
  });

  it('should return empty list if no characters are played by multiple actors', async () => {
    const movie1Credits = {
      cast: [{ name: 'Actor A', character: 'Char A' }],
    };
    const movie2Credits = {
      cast: [{ name: 'Actor A', character: 'Char A' }], 
    };

    mockCache.getOrSet.mockImplementation(async (k, fn) => fn());
    mockTmdbClient.fetchMovieCredits
        .mockResolvedValueOnce(movie1Credits)
        .mockResolvedValueOnce(movie2Credits);

    const result = await service.getCharactersWithMultipleActors();

    expect(result).toEqual([]);
  });

  it('should ignore case for character names but preserve first encountered casing', async () => {
      const movie1Credits = {
        cast: [{ name: 'Actor 1', character: 'character a' }],
      };
      const movie2Credits = {
        cast: [{ name: 'Actor 2', character: 'CHARACTER A' }],
      };
  
      mockCache.getOrSet.mockImplementation(async (k, fn) => fn());
      mockTmdbClient.fetchMovieCredits
          .mockResolvedValueOnce(movie1Credits)
          .mockResolvedValueOnce(movie2Credits);
  
      const result = await service.getCharactersWithMultipleActors();
  
      expect(result).toHaveLength(1);
      expect(result[0].characterName).toBe('character a');
      expect(result[0].actors).toEqual(expect.arrayContaining(['Actor 1', 'Actor 2']));
  });
});
