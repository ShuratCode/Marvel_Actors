import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createApiRouter({
  moviesPerActorService,
  actorService,
  characterService,
}) {
  const router = express.Router();

  router.get('/moviesPerActor', asyncHandler(async (req, res) => {
    const result = await moviesPerActorService.getMoviesPerActor();
    res.json(result);
  }));

  router.get('/actorsWithMultipleCharacters', asyncHandler(async (req, res) => {
    const result = await actorService.getActorsWithMultipleCharacters();
    res.json(result);
  }));

  router.get('/charactersWithMultipleActors', asyncHandler(async (req, res) => {
    const result = await characterService.getCharactersWithMultipleActors();
    res.json(result);
  }));

  return router;
}
