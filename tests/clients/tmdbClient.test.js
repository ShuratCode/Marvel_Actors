import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { TmdbClient } from '../../src/clients/tmdbClient.js';

jest.mock('axios');

describe('TmdbClient', () => {
  let tmdbClient;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://api.themoviedb.org/3';

  beforeEach(() => {
    tmdbClient = new TmdbClient(mockApiKey);
    jest.clearAllMocks();
  });

  describe('fetchMovieCredits', () => {
    it('should successfully fetch movie credits for a valid movie ID', async () => {
      const movieId = 1726;
      const mockResponse = {
        data: {
          id: 1726,
          cast: [
            {
              id: 3223,
              name: 'Robert Downey Jr.',
              character: 'Tony Stark / Iron Man',
              order: 0
            },
            {
              id: 1245,
              name: 'Gwyneth Paltrow',
              character: 'Pepper Potts',
              order: 1
            }
          ],
          crew: []
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await tmdbClient.fetchMovieCredits(movieId);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/movie/${movieId}/credits`,
        {
          params: {
            api_key: mockApiKey
          }
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when movie ID is invalid', async () => {
      const movieId = 999999999;
      const mockError = {
        response: {
          status: 404,
          data: {
            status_message: 'The resource you requested could not be found.'
          }
        }
      };

      axios.get.mockRejectedValue(mockError);

      await expect(tmdbClient.fetchMovieCredits(movieId)).rejects.toThrow();
    });

    it('should throw error when API key is invalid', async () => {
      const movieId = 1726;
      const mockError = {
        response: {
          status: 401,
          data: {
            status_message: 'Invalid API key: You must be granted a valid key.'
          }
        }
      };

      axios.get.mockRejectedValue(mockError);

      await expect(tmdbClient.fetchMovieCredits(movieId)).rejects.toThrow();
    });

    it('should throw error when network request fails', async () => {
      const movieId = 1726;
      const mockError = new Error('Network Error');

      axios.get.mockRejectedValue(mockError);

      await expect(tmdbClient.fetchMovieCredits(movieId)).rejects.toThrow('Network Error');
    });

    it('should handle empty cast array', async () => {
      const movieId = 1726;
      const mockResponse = {
        data: {
          id: 1726,
          cast: [],
          crew: []
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await tmdbClient.fetchMovieCredits(movieId);

      expect(result.cast).toEqual([]);
    });

    it('should include both cast and crew in response', async () => {
      const movieId = 1726;
      const mockResponse = {
        data: {
          id: 1726,
          cast: [
            {
              id: 3223,
              name: 'Robert Downey Jr.',
              character: 'Tony Stark / Iron Man',
              order: 0
            }
          ],
          crew: [
            {
              id: 1234,
              name: 'Jon Favreau',
              job: 'Director',
              department: 'Directing'
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await tmdbClient.fetchMovieCredits(movieId);

      expect(result.cast).toHaveLength(1);
      expect(result.crew).toHaveLength(1);
    });
  });
});
