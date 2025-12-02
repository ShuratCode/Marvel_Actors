import axios from 'axios';

export class TmdbClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('TMDB API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
  }

  async fetchMovieCredits(movieId) {
    if (!movieId || typeof movieId !== 'number') {
      throw new Error('Valid movie ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/movie/${movieId}/credits`,
        {
          params: {
            api_key: this.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
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

