import express from 'express';

export function createApiRouter({
  moviesPerActorController,
  actorController,
  characterController,
}) {
  const router = express.Router();

  router.get('/moviesPerActor', moviesPerActorController.getMoviesPerActor);
  router.get('/actorsWithMultipleCharacters', actorController.getActorsWithMultipleCharacters);
  router.get('/charactersWithMultipleActors', characterController.getCharactersWithMultipleActors);

  return router;
}
