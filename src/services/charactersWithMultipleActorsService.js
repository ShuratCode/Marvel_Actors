export class CharactersWithMultipleActorsService {
  constructor(tmdbClient, cache, movies) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
  }

  async getCharactersWithMultipleActors() {
    const characterActorsMap = new Map();

    const movieEntries = Object.entries(this.movies);

    await Promise.all(
      movieEntries.map(async ([, movieId]) => {
        const credits = await this.cache.getOrSet(
          `movie_credits_${movieId}`,
          () => this.tmdbClient.fetchMovieCredits(movieId)
        );

        if (credits && credits.cast) {
          credits.cast.forEach((member) => {
            const normalizedCharName = member.character.toLowerCase();
            
            if (!characterActorsMap.has(normalizedCharName)) {
              characterActorsMap.set(normalizedCharName, {
                originalName: member.character,
                actors: new Set(),
              });
            }

            const entry = characterActorsMap.get(normalizedCharName);
            entry.actors.add(member.name);
          });
        }
      })
    );

    const result = [];
    for (const { originalName, actors } of characterActorsMap.values()) {
      if (actors.size > 1) {
        result.push({
          characterName: originalName,
          actors: Array.from(actors).sort(),
        });
      }
    }

    return result;
  }
}

