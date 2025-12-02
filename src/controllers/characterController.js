import { asyncHandler } from '../utils/asyncHandler.js';

export class CharacterController {
  constructor(service) {
    this.service = service;
  }

  getCharactersWithMultipleActors = asyncHandler(async (req, res) => {
    const result = await this.service.getCharactersWithMultipleActors();
    res.json(result);
  });
}

