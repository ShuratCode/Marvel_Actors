import axios from 'axios';

export class TmdbClient {
  constructor(apiKey, timeout = 5000) {
    if (!apiKey) {
      throw new Error('TMDB API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: timeout,
      params: {
        api_key: this.apiKey
      }
    });
  }

  async fetchMovieCredits(movieId) {
    if (!movieId || typeof movieId !== 'number') {
      throw new Error('Valid movie ID is required');
    }

    try {
      const response = await this.client.get(`/movie/${movieId}/credits`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
         throw new Error('TMDB API request timed out');
      }
      if (error.response) {
        throw new Error(
          `TMDB API error: ${error.response.status} - ${error.response.data?.status_message || 'Unknown error'}`
        );
      }
      if (error.request) {
        throw new Error('Network error: Unable to reach TMDB API');
      }
      throw error;
    }
  }
}
