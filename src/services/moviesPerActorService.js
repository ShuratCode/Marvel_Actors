export class MoviesPerActorService {
  constructor(tmdbClient, cache, movies, actors) {
    this.tmdbClient = tmdbClient;
    this.cache = cache;
    this.movies = movies;
    this.actors = actors;
  }

  async getMoviesPerActor() {
    const result = {};
    this.actors.forEach((actor) => {
      result[actor] = [];
    });

    const movieEntries = Object.entries(this.movies);
    
    await Promise.all(
      movieEntries.map(async ([movieName, movieId]) => {
        const credits = await this.cache.getOrSet(
          `movie_credits_${movieId}`,
          () => this.tmdbClient.fetchMovieCredits(movieId)
        );

        this.processMovieCredits(movieName, credits, result);
      })
    );

    return result;
  }

  processMovieCredits(movieName, credits, result) {
    if (!credits || !credits.cast) {
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

