import "dotenv/config";
import express from "express";
import { movies, actors } from "./dataForQuestions.js";
import { TmdbClient } from "./src/clients/tmdbClient.js";
import { MemoryCache } from "./src/services/memoryCache.js";
import { MoviesPerActorService } from "./src/services/moviesPerActorService.js";
import { ActorService } from "./src/services/actorService.js";
import { CharacterService } from "./src/services/characterService.js";
import { createApiRouter } from "./src/routes/api.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  console.warn("WARNING: TMDB_API_KEY environment variable is not set. API calls will fail.");
}

// 1. Initialize Core Services
const tmdbClient = new TmdbClient(apiKey);
const cacheTtl = parseInt(process.env.CACHE_TTL, 10) || 3600; // Default 1 hour
const cache = new MemoryCache(cacheTtl);

// 2. Initialize Business Logic Services
const moviesPerActorService = new MoviesPerActorService(
  tmdbClient,
  cache,
  movies,
  actors
);

const actorService = new ActorService(
  tmdbClient,
  cache,
  movies
);

const characterService = new CharacterService(
  tmdbClient,
  cache,
  movies
);

// 3. Setup Routes
const apiRouter = createApiRouter({
  moviesPerActorService,
  actorService,
  characterService,
});

app.use(express.json());
app.use(requestLogger); 
app.use("/api/v1", apiRouter);

// Centralized Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
