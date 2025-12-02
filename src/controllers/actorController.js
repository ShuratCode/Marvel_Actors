import { asyncHandler } from '../utils/asyncHandler.js';

export class ActorController {
  constructor(service) {
    this.service = service;
  }

  getActorsWithMultipleCharacters = asyncHandler(async (req, res) => {
    const result = await this.service.getActorsWithMultipleCharacters();
    res.json(result);
  });
}

