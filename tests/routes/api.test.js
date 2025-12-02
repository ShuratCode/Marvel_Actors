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
      actorService: {
        getActorsWithMultipleCharacters: jest.fn(),
      },
      characterService: {
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
      const mockData = { 'Actor A': [{ movieName: 'M1', characterName: 'C1' }] };
      mockServices.actorService.getActorsWithMultipleCharacters.mockResolvedValue(mockData);

      const response = await request(app).get('/api/v1/actors-multiple-characters');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe('GET /api/v1/characters-multiple-actors', () => {
    it('should return data from service', async () => {
      const mockData = { 'Char A': [{ movieName: 'M1', actorName: 'A1' }] };
      mockServices.characterService.getCharactersWithMultipleActors.mockResolvedValue(mockData);

      const response = await request(app).get('/api/v1/characters-multiple-actors');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });
});
