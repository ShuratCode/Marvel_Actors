import { logger } from '../utils/logger.js';

export class CharacterService {
  constructor(tmdbClient, cache, movies) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
  }

  async getCharactersWithMultipleActors() {
    logger.info("Starting execution of getCharactersWithMultipleActors...");
    const characterActorsMap = new Map();

    const movieEntries = Object.entries(this.movies);

    await Promise.all(
      movieEntries.map(async ([movieName, movieId]) => {
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
    );

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
