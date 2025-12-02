import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from '../../src/routes/api.js';
import { notFoundHandler, errorHandler } from '../../src/middleware/errorHandler.js';

describe('API Routes', () => {
  let app;
  let mockServices;

  beforeEach(() => {
    mockServices = {
      moviesPerActorService: {
        getMoviesPerActor: jest.fn(),
      },
      actorService: {
        getActorsWithMultipleCharacters: jest.fn(),
      },
      characterService: {
        getCharactersWithMultipleActors: jest.fn(),
      },
    };

    const router = createApiRouter(mockServices);
    app = express();
    app.use('/', router);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('GET /moviesPerActor', () => {
    it('should return data from service', async () => {
      const mockData = { 'Actor A': ['Movie 1'] };
      mockServices.moviesPerActorService.getMoviesPerActor.mockResolvedValue(mockData);

      const response = await request(app).get('/moviesPerActor');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('should handle errors', async () => {
      mockServices.moviesPerActorService.getMoviesPerActor.mockRejectedValue(new Error('Service Error'));

      const response = await request(app).get('/moviesPerActor');

      expect(response.status).toBe(500);
      // In test env (like prod), internal errors are masked
      expect(response.body).toEqual({
        status: 'error',
        message: 'Something went very wrong!'
      });
    });
  });

  describe('GET /actorsWithMultipleCharacters', () => {
    it('should return data from service', async () => {
      const mockData = { 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] };
      mockServices.actorService.getActorsWithMultipleCharacters.mockResolvedValue(mockData);

      const response = await request(app).get('/actorsWithMultipleCharacters');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /charactersWithMultipleActors', () => {
    it('should return data from service', async () => {
      const mockData = { 'Char A': [{ movieName: 'M1', actorName: 'A1' }] };
      mockServices.characterService.getCharactersWithMultipleActors.mockResolvedValue(mockData);

      const response = await request(app).get('/charactersWithMultipleActors');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('404 Handling', () => {
    it('should return JSON 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/json/);
      // NotFoundError is operational, so it passes the message
      expect(response.body).toEqual({
        status: 'fail',
        message: expect.stringContaining('Not Found'),
      });
    });
  });
});
