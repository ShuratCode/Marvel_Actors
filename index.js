import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Data
import { movies, actors } from "./dataForQuestions.js";

// Services & Utils
import { TmdbClient } from "./src/clients/tmdbClient.js";
import { MemoryCache } from "./src/services/memoryCache.js";
import { MoviesPerActorService } from "./src/services/moviesPerActorService.js";
import { ActorService } from "./src/services/actorService.js";
import { CharacterService } from "./src/services/characterService.js";
import { logger } from "./src/utils/logger.js";
import { validateEnv } from "./src/utils/envValidation.js";

// Controllers
import { MoviesPerActorController } from "./src/controllers/moviesPerActorController.js";
import { ActorController } from "./src/controllers/actorController.js";
import { CharacterController } from "./src/controllers/characterController.js";

// Routes & Middleware
import { createApiRouter } from "./src/routes/api.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);
  process.exit(1);
});

// Validate Environment Variables
const env = validateEnv();

const app = express();

// 1. Initialize Core Services
const tmdbClient = new TmdbClient(env.TMDB_API_KEY);
const cache = new MemoryCache(env.CACHE_TTL);

// 2. Initialize Business Logic Services
const moviesPerActorService = new MoviesPerActorService(
  tmdbClient,
  cache,
  movies,
  actors,
  env.CONCURRENT_REQUESTS_LIMIT
);

const actorService = new ActorService(
  tmdbClient,
  cache,
  movies,
  env.CONCURRENT_REQUESTS_LIMIT
);

const characterService = new CharacterService(
  tmdbClient,
  cache,
  movies,
  env.CONCURRENT_REQUESTS_LIMIT
);

// 3. Initialize Controllers
const moviesPerActorController = new MoviesPerActorController(moviesPerActorService);
const actorController = new ActorController(actorService);
const characterController = new CharacterController(characterService);

// 4. Setup Routes
const apiRouter = createApiRouter({
  moviesPerActorController,
  actorController,
  characterController,
});

// Security Middleware
app.use(helmet()); 
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      status: 'fail',
      message: options.message
    });
  }
});

app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(requestLogger); 

app.use("/", apiRouter);

app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
