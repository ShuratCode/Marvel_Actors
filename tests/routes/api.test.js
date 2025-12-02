import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from '../../src/routes/api.js';
import { MoviesPerActorController } from '../../src/controllers/moviesPerActorController.js';
import { ActorController } from '../../src/controllers/actorController.js';
import { CharacterController } from '../../src/controllers/characterController.js';
import { notFoundHandler, errorHandler } from '../../src/middleware/errorHandler.js';

describe('API Routes Integration', () => {
  let app;
  let mockMoviesPerActorService;
  let mockActorService;
  let mockCharacterService;

  beforeEach(() => {
    // Mock Services
    mockMoviesPerActorService = {
      getMoviesPerActor: jest.fn().mockResolvedValue({ 'Actor A': ['Movie 1'] }),
    };
    mockActorService = {
      getActorsWithMultipleCharacters: jest.fn().mockResolvedValue({ 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] }),
    };
    mockCharacterService = {
      getCharactersWithMultipleActors: jest.fn().mockResolvedValue({ 'Char A': [{ movieName: 'M1', actorName: 'A1' }] }),
    };

    // Real Controllers with Mock Services
    const moviesPerActorController = new MoviesPerActorController(mockMoviesPerActorService);
    const actorController = new ActorController(mockActorService);
    const characterController = new CharacterController(mockCharacterService);

    const router = createApiRouter({
      moviesPerActorController,
      actorController,
      characterController,
    });

    app = express();
    app.use(express.json());
    app.use('/', router);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('GET /moviesPerActor', () => {
    it('should return 200 and data from service', async () => {
      const response = await request(app).get('/moviesPerActor');

      expect(mockMoviesPerActorService.getMoviesPerActor).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Actor A': ['Movie 1'] });
    });

    it('should handle service errors', async () => {
        mockMoviesPerActorService.getMoviesPerActor.mockRejectedValue(new Error('Service Error'));
        const response = await request(app).get('/moviesPerActor');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /actorsWithMultipleCharacters', () => {
    it('should return 200 and data from service', async () => {
      const response = await request(app).get('/actorsWithMultipleCharacters');

      expect(mockActorService.getActorsWithMultipleCharacters).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] });
    });
  });

  describe('GET /charactersWithMultipleActors', () => {
    it('should return 200 and data from service', async () => {
      const response = await request(app).get('/charactersWithMultipleActors');

      expect(mockCharacterService.getCharactersWithMultipleActors).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Char A': [{ movieName: 'M1', actorName: 'A1' }] });
    });
  });
});
