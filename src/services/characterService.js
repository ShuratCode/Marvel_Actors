import { logger } from '../utils/logger.js';
import pLimit from 'p-limit';

export class CharacterService {
  constructor(tmdbClient, cache, movies, concurrencyLimit = 5) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
    this.limit = pLimit(Number(concurrencyLimit) || 5);
  }

  async getCharactersWithMultipleActors() {
    logger.info("Starting execution of getCharactersWithMultipleActors...");
    const characterActorsMap = new Map();

    const movieEntries = Object.entries(this.movies);

    const results = await Promise.allSettled(
      movieEntries.map(([movieName, movieId]) => 
        this.limit(async () => {
          const credits = await this.cache.getOrSet(
            `movie_credits_${movieId}`,
            () => this.tmdbClient.fetchMovieCredits(movieId)
          );

          if (credits?.cast) {
            credits.cast.forEach((member) => {
              const normalizedCharName = member.character.toLowerCase();
              
              if (!characterActorsMap.has(normalizedCharName)) {
                characterActorsMap.set(normalizedCharName, {
                  originalName: member.character,
                  appearances: [],
                });
              }

              const entry = characterActorsMap.get(normalizedCharName);
              entry.appearances.push({
                movieName: movieName,
                actorName: member.name
              });
            });
          }
        })
      )
    );

    results.forEach((promiseResult, index) => {
      if (promiseResult.status === 'rejected') {
        const [movieName] = movieEntries[index];
        logger.error(`Failed to process movie "${movieName}": ${promiseResult.reason}`);
      }
    });

    const result = {};
    for (const { originalName, appearances } of characterActorsMap.values()) {
      const uniqueActors = new Set(appearances.map(a => a.actorName));
      if (uniqueActors.size > 1) {
        result[originalName] = appearances;
      }
    }

    logger.info("Finished execution of getCharactersWithMultipleActors.");
    return result;
  }
}
