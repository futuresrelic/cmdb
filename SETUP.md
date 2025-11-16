# CMDB Setup Instructions

## Environment Variables

To enable full functionality including IMDB data fetching, you need to set up API keys.

### Required API Keys

1. **TMDB API Key** (for The Movie Database)
   - Get your key at: https://www.themoviedb.org/settings/api
   - Required for: Movie metadata, posters, cast/crew information

2. **OMDB API Key** (for IMDB data via Open Movie Database)
   - Get your key at: http://www.omdbapi.com/apikey.aspx
   - Required for: IMDB IDs, IMDB ratings, additional metadata

### Configuration

Create a `.env` file in the root directory of the project with the following content:

```env
# Database
DB_PASSWORD=cmdb_password

# External APIs
TMDB_API_KEY=your_actual_tmdb_key_here
OMDB_API_KEY=your_actual_omdb_key_here

# CORS (for production, set to your domain)
CORS_ORIGIN=https://cmdb.futuresrelic.com
```

### Deployment

After creating/updating the `.env` file, rebuild and restart the containers:

```powershell
docker-compose down
docker-compose up -d --build
```

## Notes

- Without OMDB_API_KEY, IMDB data will not be fetched during CSV imports
- TMDB data will still work if only TMDB_API_KEY is configured
- The application will run without these keys, but with limited functionality
