import "dotenv/config";
import express from "express";
import { movies, actors } from "./dataForQuestions.js";
import { TmdbClient } from "./src/clients/tmdbClient.js";
import { MemoryCache } from "./src/services/memoryCache.js";
import { MoviesPerActorService } from "./src/services/moviesPerActorService.js";
import { ActorService } from "./src/services/actorService.js";
import { CharacterService } from "./src/services/characterService.js";
import { createApiRouter } from "./src/routes/api.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { logger } from "./src/utils/logger.js";

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);
  process.exit(1);
});

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
  logger.warn("WARNING: TMDB_API_KEY environment variable is not set. API calls will fail.");
}

// 1. Initialize Core Services
const tmdbClient = new TmdbClient(apiKey);
const cacheTtl = Number.parseInt(process.env.CACHE_TTL, 10) || 3600; // Default 1 hour
const cache = new MemoryCache(cacheTtl);
const concurrencyLimit = Number.parseInt(process.env.CONCURRENT_REQUESTS_LIMIT, 10) || 5;

// 2. Initialize Business Logic Services
const moviesPerActorService = new MoviesPerActorService(
  tmdbClient,
  cache,
  movies,
  actors,
  concurrencyLimit
);

const actorService = new ActorService(
  tmdbClient,
  cache,
  movies,
  concurrencyLimit
);

const characterService = new CharacterService(
  tmdbClient,
  cache,
  movies,
  concurrencyLimit
);

// 3. Setup Routes
const apiRouter = createApiRouter({
  moviesPerActorService,
  actorService,
  characterService,
});

app.use(express.json());
app.use(requestLogger); 
app.use("/", apiRouter);

app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
