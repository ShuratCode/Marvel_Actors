# Backend Assignment - MCU API Service

This project is a Node.js Express application that provides insights into the Marvel Cinematic Universe (MCU) using the TMDB API. It answers specific questions about actors and characters in the MCU.

## Features

- **Movies Per Actor**: Lists which MCU movies each actor has appeared in.
- **Actors With Multiple Characters**: Identifies actors who have played multiple different characters in the MCU.
- **Characters With Multiple Actors**: Identifies characters that have been played by more than one actor.
- **In-Memory Caching**: Implements a cache-aside pattern to minimize calls to the external TMDB API.
- **Error Handling**: Centralized error handling for robust API responses.

## Prerequisites

- Node.js (LTS version recommended, e.g., v18+ or v20+)
- NPM
- A TMDB API Key (Get one [here](https://www.themoviedb.org/documentation/api))

## Setup

1. **Install Dependencies**:

    ```bash
    npm install
    ```

2. **Environment Configuration**:
    Create a `.env` file in the root directory based on `.env.example`:

    ```bash
    cp .env.example .env
    ```

    Open `.env` and add your TMDB API Key:

    ```shell
    TMDB_API_KEY=your_actual_api_key_here
    PORT=3000
    ```

## Running the Application

- **Development Mode**:

  ```bash
  npm run dev
  ```

- **Production Start**:

  ```bash
  npm start
  ```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## Testing

The project uses **Jest** for unit and integration testing.

- **Run all tests**:

  ```bash
  npm test
  ```

- **Run tests in watch mode**:

  ```bash
  npm run test:watch
  ```

## API Documentation

Base URL: `/api/v1`

### 1. Get Movies Per Actor

Returns a mapping of actors to the list of MCU movies they appeared in.

- **Endpoint**: `GET /api/v1/movies-per-actor`
- **Response**:

  ```json
  {
    "Robert Downey Jr.": [
      "Iron Man",
      "The Avengers",
      ...
    ],
    "Chris Evans": [
      "Captain America: The First Avenger",
      ...
    ]
  }
  ```

### 2. Get Actors With Multiple Characters

Returns a list of actors who have played more than one unique character.

- **Endpoint**: `GET /api/v1/actors-multiple-characters`
- **Response**:

  ```json
  [
    {
      "actorName": "Chris Evans",
      "characters": [
        "Human Torch",
        "Captain America"
      ]
    },
    ...
  ]
  ```

### 3. Get Characters With Multiple Actors

Returns a list of characters that have been portrayed by more than one actor.

- **Endpoint**: `GET /api/v1/characters-multiple-actors`
- **Response**:

  ```json
  [
    {
      "characterName": "Bruce Banner / The Hulk",
      "actors": [
        "Edward Norton",
        "Mark Ruffalo"
      ]
    },
    ...
  ]
  ```

## Project Structure

```shell
.
├── src/
│   ├── clients/        # External API clients (TMDB)
│   ├── middleware/     # Express middleware (Error handling)
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic services
│   └── app.js          # (Implicit in index.js for this simple setup)
├── tests/              # Jest tests mirroring src structure
├── dataForQuestions.js # Input data (movies/actors list)
├── index.js            # Entry point
└── package.json
```

## Design Decisions

- **Service-Oriented Architecture**: Business logic is separated into services (`MoviesPerActorService`, etc.) to make them testable and reusable.
- **Dependency Injection**: Services receive their dependencies (Client, Cache, Data) in the constructor, allowing easy mocking in tests.
- **Cache-Aside Pattern**: The `MemoryCache` service wraps API calls. It checks the cache first; if missing, it fetches from the API and updates the cache.
- **TDD (Test-Driven Development)**: All features were implemented by writing tests first.
