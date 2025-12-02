import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApiRouter } from '../../src/routes/api.js';

describe('API Routes', () => {
  let app;
  let mockServices;

  beforeEach(() => {
    mockServices = {
      moviesPerActorService: {
        getMoviesPerActor: jest.fn(),
      },
      actorsMultipleCharactersService: {
        getActorsWithMultipleCharacters: jest.fn(),
      },
      charactersWithMultipleActorsService: {
        getCharactersWithMultipleActors: jest.fn(),
      },
    };

    const router = createApiRouter(mockServices);
    app = express();
    app.use('/api/v1', router);
  });

  describe('GET /api/v1/movies-per-actor', () => {
    it('should return data from service', async () => {
      const mockData = { 'Actor A': ['Movie 1'] };
      mockServices.moviesPerActorService.getMoviesPerActor.mockResolvedValue(mockData);

      const response = await request(app).get('/api/v1/movies-per-actor');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('should handle errors', async () => {
      mockServices.moviesPerActorService.getMoviesPerActor.mockRejectedValue(new Error('Service Error'));

      const response = await request(app).get('/api/v1/movies-per-actor');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/actors-multiple-characters', () => {
    it('should return data from service', async () => {
      const mockData = [{ actorName: 'Actor A', characters: ['C1', 'C2'] }];
      mockServices.actorsMultipleCharactersService.getActorsWithMultipleCharacters.mockResolvedValue(mockData);

      const response = await request(app).get('/api/v1/actors-multiple-characters');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /api/v1/characters-multiple-actors', () => {
    it('should return data from service', async () => {
      const mockData = [{ characterName: 'Char A', actors: ['A1', 'A2'] }];
      mockServices.charactersWithMultipleActorsService.getCharactersWithMultipleActors.mockResolvedValue(mockData);

      const response = await request(app).get('/api/v1/characters-multiple-actors');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });
});

