import { logger } from '../utils/logger.js';
import pLimit from 'p-limit';

export class MoviesPerActorService {
  constructor(tmdbClient, cache, movies, actors, concurrencyLimit = 5) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
    this.actors = actors;
    this.limit = pLimit(concurrencyLimit);
  }

  async getMoviesPerActor() {
    logger.info("Starting execution of getMoviesPerActor...");
    const result = {};
    this.actors.forEach((actor) => {
      result[actor] = [];
    });

    const movieEntries = Object.entries(this.movies);
    
    await Promise.all(
      movieEntries.map(([movieName, movieId]) => 
        this.limit(async () => {
          const credits = await this.cache.getOrSet(
            `movie_credits_${movieId}`,
            () => this.tmdbClient.fetchMovieCredits(movieId)
          );

          this.processMovieCredits(movieName, credits, result);
        })
      )
    );

    logger.info("Finished execution of getMoviesPerActor.");
    return result;
  }

  processMovieCredits(movieName, credits, result) {
    if (!credits?.cast) {
      return;
    }

    const castNames = new Set(
      credits.cast.map((member) => member.name.toLowerCase())
    );

    this.actors.forEach((actor) => {
      if (castNames.has(actor.toLowerCase())) {
        result[actor].push(movieName);
      }
    });
  }
}
