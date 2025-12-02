export class ActorsMultipleCharactersService {
  constructor(tmdbClient, cache, movies) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
  }

  async getActorsWithMultipleCharacters() {
    const actorCharactersMap = new Map();

    const movieEntries = Object.entries(this.movies);

    await Promise.all(
      movieEntries.map(async ([, movieId]) => {
        const credits = await this.cache.getOrSet(
          `movie_credits_${movieId}`,
          () => this.tmdbClient.fetchMovieCredits(movieId)
        );

        if (credits && credits.cast) {
          credits.cast.forEach((member) => {
            const normalizedName = member.name.toLowerCase();
            
            if (!actorCharactersMap.has(normalizedName)) {
              actorCharactersMap.set(normalizedName, {
                originalName: member.name,
                characters: new Set(),
              });
            }

            const entry = actorCharactersMap.get(normalizedName);
            entry.characters.add(member.character);
          });
        }
      })
    );

    const result = [];
    for (const { originalName, characters } of actorCharactersMap.values()) {
      if (characters.size > 1) {
        result.push({
          actorName: originalName,
          characters: Array.from(characters).sort(),
        });
      }
    }

    return result;
  }
}

