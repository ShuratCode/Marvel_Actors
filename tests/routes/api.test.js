import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from '../../src/routes/api.js';
import { notFoundHandler, errorHandler } from '../../src/middleware/errorHandler.js';

describe('API Routes', () => {
  let app;
  let mockControllers;

  beforeEach(() => {
    mockControllers = {
      moviesPerActorController: {
        getMoviesPerActor: jest.fn((req, res) => res.json({ 'Actor A': ['Movie 1'] })),
      },
      actorController: {
        getActorsWithMultipleCharacters: jest.fn((req, res) => res.json({ 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] })),
      },
      characterController: {
        getCharactersWithMultipleActors: jest.fn((req, res) => res.json({ 'Char A': [{ movieName: 'M1', actorName: 'A1' }] })),
      },
    };

    const router = createApiRouter(mockControllers);
    app = express();
    app.use('/', router);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('GET /moviesPerActor', () => {
    it('should call controller', async () => {
      const response = await request(app).get('/moviesPerActor');

      expect(mockControllers.moviesPerActorController.getMoviesPerActor).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Actor A': ['Movie 1'] });
    });
  });

  describe('GET /actorsWithMultipleCharacters', () => {
    it('should call controller', async () => {
      const response = await request(app).get('/actorsWithMultipleCharacters');

      expect(mockControllers.actorController.getActorsWithMultipleCharacters).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] });
    });
  });

  describe('GET /charactersWithMultipleActors', () => {
    it('should call controller', async () => {
      const response = await request(app).get('/charactersWithMultipleActors');

      expect(mockControllers.characterController.getCharactersWithMultipleActors).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 'Char A': [{ movieName: 'M1', actorName: 'A1' }] });
    });
  });
});
