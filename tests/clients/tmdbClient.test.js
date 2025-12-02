import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import { TmdbClient } from '../../src/clients/tmdbClient.js';

jest.mock('axios');

describe('TmdbClient', () => {
  const mockApiKey = 'mock-api-key';
  let tmdbClient;
  let mockAxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAxiosInstance = {
      get: jest.fn(),
    };
    axios.create.mockReturnValue(mockAxiosInstance);

    tmdbClient = new TmdbClient(mockApiKey);
  });

  it('should be initialized with API key and default timeout', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://api.themoviedb.org/3',
      timeout: 5000,
      params: { api_key: mockApiKey }
    }));
  });

  it('should allow custom timeout configuration', () => {
    const customClient = new TmdbClient(mockApiKey, 10000);
    expect(customClient).toBeInstanceOf(TmdbClient);
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
      timeout: 10000
    }));
  });

  it('should throw error if API key is missing', () => {
    expect(() => new TmdbClient()).toThrow('TMDB API key is required');
  });

  describe('fetchMovieCredits', () => {
    it('should fetch movie credits successfully', async () => {
      const mockCredits = { id: 123, cast: [] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockCredits });

      const result = await tmdbClient.fetchMovieCredits(123);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/movie/123/credits');
      expect(result).toEqual(mockCredits);
    });

    it('should throw error for invalid movie ID', async () => {
      await expect(tmdbClient.fetchMovieCredits(null)).rejects.toThrow('Valid movie ID is required');
      await expect(tmdbClient.fetchMovieCredits('123')).rejects.toThrow('Valid movie ID is required');
    });

    it('should handle API errors', async () => {
      const error = {
        response: {
          status: 404,
          data: { status_message: 'Movie not found' }
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(tmdbClient.fetchMovieCredits(123)).rejects.toThrow('TMDB API error: 404 - Movie not found');
    });

    it('should handle network errors', async () => {
      const error = {
        request: {},
        // no response
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(tmdbClient.fetchMovieCredits(123)).rejects.toThrow('Network error: Unable to reach TMDB API');
    });

    it('should handle timeout errors', async () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(tmdbClient.fetchMovieCredits(123)).rejects.toThrow('TMDB API request timed out');
    });

    it('should rethrow unknown errors', async () => {
      const error = new Error('Something weird happened');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(tmdbClient.fetchMovieCredits(123)).rejects.toThrow('Something weird happened');
    });
  });
});
