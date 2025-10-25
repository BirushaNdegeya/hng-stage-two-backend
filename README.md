# HNG Stage Zero Backend

A RESTful API endpoint that serves profile information combined with dynamic cat facts from an external API. This project demonstrates API integration, JSON response formatting, and dynamic data handling.

## Features

- **GET /**: Welcome endpoint with API information
- **GET /me**: Profile endpoint with dynamic cat facts and current timestamp
- Dynamic timestamp generation (UTC ISO 8601 format)
- Cat facts integration from https://catfact.ninja/fact
- Error handling for external API failures
- Timeout handling for API requests (5 seconds)
- CORS enabled for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Request logging for debugging

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- pnpm (package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BirushaNdegeya/hng-stage-zero-backend.git
   cd hng-stage-zero-backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory:

   ```env
   PORT=3000
   FUN_FACT_API=https://catfact.ninja
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

5. For production:
   ```bash
   pnpm run start
   ```

## API Endpoints

### GET /

Returns basic API information.

**Response:**

```json
{
  "message": "HNG Stage Zero Backend Task API is running 🚀",
  "nextStep": "Go to /me endpoint to view profile with dynamic cat facts",
  "documentation": "Check README for API usage guidelines"
}
```

### GET /me

Returns user profile with a dynamic cat fact and current timestamp.

**Response:**

```json
{
  "status": "success",
  "user": {
    "email": "birushandegeya@gmail.com",
    "name": "Birusha Ndegeya",
    "stack": "Node.js/Express"
  },
  "timestamp": "2025-01-15T12:34:56.789Z",
  "fact": "Cats have 32 muscles that control the outer ear."
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `FUN_FACT_API`: Base URL for cat facts API (default: https://catfact.ninja)

## Dependencies

- `express`: Web framework for Node.js
- `cors`: Cross-Origin Resource Sharing middleware
- `express-rate-limit`: Rate limiting middleware
- `dotenv`: Environment variable management

## Development Dependencies

- `nodemon`: Automatic server restart during development

## Testing

Test the endpoints using curl:

```bash
# Test root endpoint
curl https://hng-stage-zero-backend-flax.vercel.app/

# Test /me endpoint
curl https://hng-stage-zero-backend-flax.vercel.app/me
```

## Testing Locally

Test the endpoints using curl:

```bash
# Test root endpoint
curl http://localhost:3000/

# Test /me endpoint
curl http://localhost:3000/me
```

## Project Structure

```
hng-stage-zero-backend/
├── src/
│   ├── index.js          # Main application file
│   └── utils/
│       └── get-fact.js   # Cat facts API utility
├── .env                  # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # Lock file for pnpm
└── README.md             # This file
```
