import express from 'express';

export function createApiRouter({
  moviesPerActorService,
  actorService,
  characterService,
}) {
  const router = express.Router();

  router.get('/moviesPerActor', async (req, res, next) => {
    try {
      const result = await moviesPerActorService.getMoviesPerActor();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/actorsWithMultipleCharacters', async (req, res, next) => {
    try {
      const result = await actorService.getActorsWithMultipleCharacters();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/charactersWithMultipleActors', async (req, res, next) => {
    try {
      const result = await characterService.getCharactersWithMultipleActors();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

