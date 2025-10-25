# HNG Stage Two Backend - Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with exchange rate calculations and image generation. This project demonstrates API integration, database persistence, image generation, and comprehensive error handling.

## Features

- **GET /**: Welcome endpoint with API information
- **GET /me**: Profile endpoint with dynamic cat facts and current timestamp
- **POST /countries/refresh**: Fetch and cache country data with exchange rates
- **GET /countries**: Retrieve all countries with optional filters and sorting
- **GET /countries/:name**: Get specific country by name
- **DELETE /countries/:name**: Delete a country record
- **GET /status**: Get total countries and last refresh timestamp
- **GET /countries/image**: Serve generated summary image
- MySQL database integration for data persistence
- External API integration (restcountries.com, open.er-api.com)
- Automatic image generation with summary data
- Dynamic timestamp generation (UTC ISO 8601 format)
- Cat facts integration from https://catfact.ninja/fact
- Comprehensive error handling and validation
- Timeout handling for API requests (10 seconds)
- CORS enabled for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Request logging for debugging

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (package manager)
- MySQL database server (version 8.0 or higher)

### Database Setup

1. Install and start MySQL server on your system.

2. Create a new database named `countries_db` (or update `DB_NAME` in `.env`):

   ```sql
   CREATE DATABASE countries_db;
   ```

3. The application will automatically create the `countries` table on first startup. No additional SQL scripts are needed.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/hng-stage-two-backend.git
   cd hng-stage-two-backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory based on `.env.example`:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=countries_db
   DB_PORT=3306
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

### Running Locally

- The server will start on `http://localhost:3000`
- First, call `POST /countries/refresh` to populate the database with country data.
- Use tools like Postman, curl, or Insomnia to test endpoints.

### Hosting

This API can be hosted on platforms like Railway, Heroku, AWS, or Pxxl App. Ensure your hosting provider supports Node.js and MySQL databases.

**Note:** Vercel is not allowed for this cohort.

## API Endpoints

### GET /

Returns basic API information.

**Response:**

```json
{
  "message": "HNG Stage Two Backend Task API is running 🚀",
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

### POST /countries/refresh

Fetches country data from external APIs, processes exchange rates, calculates estimated GDP, and caches everything in the database. Also generates a summary image.

**Response:**

```json
{
  "message": "Countries data refreshed successfully"
}
```

**Error Response (503):**

```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from [API name]"
}
```

### GET /countries

Retrieves all countries from the database with optional filtering and sorting.

**Query Parameters:**
- `region`: Filter by region (e.g., `?region=Africa`)
- `currency`: Filter by currency code (e.g., `?currency=NGN`)
- `sort`: Sort by GDP (e.g., `?sort=gdp_desc` or `?sort=gdp_asc`)

**Response:**

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### GET /countries/:name

Retrieves a specific country by name (case-insensitive).

**Response:** Same as individual country object above.

**Error Response (404):**

```json
{
  "error": "Country not found"
}
```

### DELETE /countries/:name

Deletes a country record by name (case-insensitive).

**Response:**

```json
{
  "message": "Country deleted successfully"
}
```

**Error Response (404):**

```json
{
  "error": "Country not found"
}
```

### GET /status

Returns the total number of countries and last refresh timestamp.

**Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### GET /countries/image

Serves the generated summary image (PNG format) containing total countries, top 5 by GDP, and last refresh timestamp.

**Error Response (404):**

```json
{
  "error": "Summary image not found"
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DB_HOST`: MySQL database host (default: localhost)
- `DB_USER`: MySQL database user (default: root)
- `DB_PASSWORD`: MySQL database password
- `DB_NAME`: MySQL database name (default: countries_db)
- `DB_PORT`: MySQL database port (default: 3306)
- `FUN_FACT_API`: Base URL for cat facts API (default: https://catfact.ninja)

## Dependencies

- `express`: Web framework for Node.js
- `cors`: Cross-Origin Resource Sharing middleware
- `express-rate-limit`: Rate limiting middleware
- `dotenv`: Environment variable management
- `mysql2`: MySQL database driver
- `axios`: HTTP client for external API calls
- `canvas`: Image generation library

## Development Dependencies

- `nodemon`: Automatic server restart during development

## Testing

### Testing Locally

Test the endpoints using curl:

```bash
# Test root endpoint
curl http://localhost:3000/

# Test /me endpoint
curl http://localhost:3000/me

# Refresh country data (call this first)
curl -X POST http://localhost:3000/countries/refresh

# Get all countries
curl http://localhost:3000/countries

# Get countries filtered by region
curl "http://localhost:3000/countries?region=Africa"

# Get countries sorted by GDP descending
curl "http://localhost:3000/countries?sort=gdp_desc"

# Get specific country
curl http://localhost:3000/countries/Nigeria

# Get status
curl http://localhost:3000/status

# Get summary image (save to file)
curl -o summary.png http://localhost:3000/countries/image

# Delete a country
curl -X DELETE http://localhost:3000/countries/TestCountry
```

### Testing Hosted API

Replace `http://localhost:3000` with your hosted API URL.

## Project Structure

```
hng-stage-two-backend/
├── cache/                # Generated images directory
│   └── summary.png       # Auto-generated summary image
├── src/
│   ├── index.js          # Main application file
│   ├── db.js             # MySQL database connection
│   ├── models/
│   │   └── country.js    # Country database operations
│   └── utils/
│       ├── get-fact.js   # Cat facts API utility
│       ├── fetchCountries.js  # Countries API fetch utility
│       ├── fetchRates.js      # Exchange rates API utility
│       └── generateImage.js   # Image generation utility
├── .env                  # Environment variables (create this)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies and scripts
├── pnpm-lock.yaml        # Lock file for pnpm
└── README.md             # This file
```
