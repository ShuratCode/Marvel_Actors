import { logger } from '../utils/logger.js';
import pLimit from 'p-limit';

export class ActorService {
  constructor(tmdbClient, cache, movies, concurrencyLimit = 5) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
    this.limit = pLimit(concurrencyLimit);
  }

  async getActorsWithMultipleCharacters() {
    logger.info("Starting execution of getActorsWithMultipleCharacters...");
    const actorCharactersMap = new Map();

    const movieEntries = Object.entries(this.movies);

    await Promise.all(
      movieEntries.map(([movieName, movieId]) => 
        this.limit(async () => {
          const credits = await this.cache.getOrSet(
            `movie_credits_${movieId}`,
            () => this.tmdbClient.fetchMovieCredits(movieId)
          );

          if (credits?.cast) {
            credits.cast.forEach((member) => {
              const normalizedName = member.name.toLowerCase();
              
              if (!actorCharactersMap.has(normalizedName)) {
                actorCharactersMap.set(normalizedName, {
                  originalName: member.name,
                  roles: [],
                });
              }

              const entry = actorCharactersMap.get(normalizedName);
              entry.roles.push({
                movieName: movieName,
                characterName: member.character
              });
            });
          }
        })
      )
    );

    const result = {};
    for (const { originalName, roles } of actorCharactersMap.values()) {
      const uniqueCharacterNames = new Set(roles.map(r => r.characterName));
      if (uniqueCharacterNames.size > 1) {
        result[originalName] = roles;
      }
    }

    logger.info("Finished execution of getActorsWithMultipleCharacters.");
    return result;
  }
}
