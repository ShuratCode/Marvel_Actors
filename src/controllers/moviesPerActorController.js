import { asyncHandler } from '../utils/asyncHandler.js';

export class MoviesPerActorController {
  constructor(service) {
    this.service = service;
  }

  getMoviesPerActor = asyncHandler(async (req, res) => {
    const result = await this.service.getMoviesPerActor();
    res.json(result);
  });
}

