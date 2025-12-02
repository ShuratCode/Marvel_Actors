import "dotenv/config";
import express from "express";
import { movies, actors } from "./dataForQuestions.js";
import { TmdbClient } from "./src/clients/tmdbClient.js";
import { MemoryCache } from "./src/services/memoryCache.js";
import { MoviesPerActorService } from "./src/services/moviesPerActorService.js";
import { ActorsMultipleCharactersService } from "./src/services/actorsMultipleCharactersService.js";
import { CharactersWithMultipleActorsService } from "./src/services/charactersWithMultipleActorsService.js";
import { createApiRouter } from "./src/routes/api.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  console.warn("WARNING: TMDB_API_KEY environment variable is not set. API calls will fail.");
}

// 1. Initialize Core Services
const tmdbClient = new TmdbClient(apiKey);
const cache = new MemoryCache(60 * 60); // 1 hour TTL default

// 2. Initialize Business Logic Services
const moviesPerActorService = new MoviesPerActorService(
  tmdbClient,
  cache,
  movies,
  actors
);

const actorsMultipleCharactersService = new ActorsMultipleCharactersService(
  tmdbClient,
  cache,
  movies
);

const charactersWithMultipleActorsService = new CharactersWithMultipleActorsService(
  tmdbClient,
  cache,
  movies
);

// 3. Setup Routes
const apiRouter = createApiRouter({
  moviesPerActorService,
  actorsMultipleCharactersService,
  charactersWithMultipleActorsService,
});

app.use(express.json());
app.use("/api/v1", apiRouter);

// Centralized Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
