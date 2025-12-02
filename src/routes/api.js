import express from 'express';

export function createApiRouter({
  moviesPerActorService,
  actorsMultipleCharactersService,
  charactersWithMultipleActorsService,
}) {
  const router = express.Router();

  router.get('/movies-per-actor', async (req, res, next) => {
    try {
      const result = await moviesPerActorService.getMoviesPerActor();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/actors-multiple-characters', async (req, res, next) => {
    try {
      const result = await actorsMultipleCharactersService.getActorsWithMultipleCharacters();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/characters-multiple-actors', async (req, res, next) => {
    try {
      const result = await charactersWithMultipleActorsService.getCharactersWithMultipleActors();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

