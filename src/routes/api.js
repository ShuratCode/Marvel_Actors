import express from 'express';

export function createApiRouter({
  moviesPerActorService,
  actorService,
  characterService,
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
      const result = await actorService.getActorsWithMultipleCharacters();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/characters-multiple-actors', async (req, res, next) => {
    try {
      const result = await characterService.getCharactersWithMultipleActors();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

