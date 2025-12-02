import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CharacterService } from '../../src/services/characterService.js';

describe('CharacterService', () => {
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

    service = new CharacterService(mockTmdbClient, mockCache, mockMovies, 5);
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
    
    expect(result).toEqual({
      'Bruce Banner / The Hulk': expect.arrayContaining([
        { movieName: 'Movie 1', actorName: 'Edward Norton' },
        { movieName: 'Movie 2', actorName: 'Mark Ruffalo' }
      ])
    });
  });

  it('should return empty object if no characters are played by multiple actors', async () => {
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

    expect(result).toEqual({});
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
  
      const keys = Object.keys(result);
      expect(keys).toHaveLength(1);
      expect(result[keys[0]]).toEqual(expect.arrayContaining([
          { movieName: 'Movie 1', actorName: 'Actor 1' },
          { movieName: 'Movie 2', actorName: 'Actor 2' }
      ]));
  });
});
