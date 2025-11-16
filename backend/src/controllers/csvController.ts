import { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import tmdbService from '../services/tmdbService';
import omdbService from '../services/omdbService';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('file');

export const importFromCSV = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const results: any[] = [];
  const errors: any[] = [];
  let imported = 0;
  let skipped = 0;
  let enriched = 0; // Count of movies enriched with TMDB/IMDB data

  // Parse CSV from buffer
  const stream = Readable.from(req.file.buffer.toString());

  await new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  // Process each row
  for (const row of results) {
    try {
      // Map CSV columns to our schema (flexible mapping)
      const title = row.title || row.Title || row.name || row.Name;

      if (!title) {
        errors.push({ row, error: 'Missing title' });
        skipped++;
        continue;
      }

      // Check if movie already exists
      const existing = await prisma.movie.findFirst({
        where: {
          title: {
            equals: title,
            mode: 'insensitive'
          },
          year: row.year ? parseInt(row.year) : undefined
        },
        include: {
          externalMatches: true
        }
      });

      // Parse year
      let year = null;
      if (row.year || row.Year || row.release_date || row.releaseDate) {
        const yearStr = row.year || row.Year || row.release_date || row.releaseDate;
        const yearMatch = yearStr.match(/\d{4}/);
        if (yearMatch) {
          year = parseInt(yearMatch[0]);
        }
      }

      // Parse runtime
      let runtime = null;
      if (row.runtime || row.Runtime || row.duration || row.Duration) {
        const runtimeStr = String(row.runtime || row.Runtime || row.duration || row.Duration);
        const runtimeMatch = runtimeStr.match(/\d+/);
        if (runtimeMatch) {
          runtime = parseInt(runtimeMatch[0]);
        }
      }

      // Parse rating
      let rating = null;
      if (row.rating || row.Rating || row.vote_average || row.imdbRating) {
        const ratingStr = row.rating || row.Rating || row.vote_average || row.imdbRating;
        const ratingNum = parseFloat(ratingStr);
        if (!isNaN(ratingNum)) {
          rating = ratingNum;
        }
      }

      // Fetch data from ALL external sources
      const tmdbId = row.tmdb_id || row.tmdbId || row.TMDB_ID;
      let imdbId = row.imdb_id || row.imdbId || row.IMDB_ID;
      const externalDataSources: any = {
        tmdb: null,
        imdb: null
      };
      let sourceType = 'MANUAL';
      let fetchedAny = false;

      // Fetch from TMDB if ID provided
      if (tmdbId && tmdbId !== '') {
        try {
          const tmdbData = await tmdbService.getMovieDetails(parseInt(tmdbId));
          externalDataSources.tmdb = {
            plot: tmdbData.overview,
            tagline: tmdbData.tagline,
            language: tmdbData.original_language,
            posterUrl: tmdbService.getPosterUrl(tmdbData.poster_path),
            backdropUrl: tmdbService.getBackdropUrl(tmdbData.backdrop_path),
            rating: tmdbData.vote_average,
            runtime: tmdbData.runtime,
            originalTitle: tmdbData.original_title,
            year: tmdbData.release_date ? parseInt(tmdbData.release_date.substring(0, 4)) : null,
            contentRating: null // TODO: Fetch from TMDB certification endpoint
          };
          fetchedAny = true;

          // If no IMDB ID provided in CSV, try to get it from TMDB
          if (!imdbId || imdbId === '') {
            try {
              const externalIds = await tmdbService.getExternalIds(parseInt(tmdbId));
              if (externalIds.imdb_id) {
                imdbId = externalIds.imdb_id;
                console.log(`Found IMDB ID ${imdbId} from TMDB for movie: ${title}`);
              }
            } catch (error) {
              console.log(`Failed to fetch external IDs from TMDB for ID ${tmdbId}:`, error);
            }
          }
        } catch (error) {
          console.log(`Failed to fetch TMDB data for ID ${tmdbId}:`, error);
        }
      }

      // Fetch from IMDB (via OMDB) if ID provided or found from TMDB
      if (imdbId && imdbId !== '') {
        try {
          const imdbData = await omdbService.getMovieByImdbId(imdbId);
          if (imdbData) {
            externalDataSources.imdb = {
              plot: imdbData.Plot !== 'N/A' ? imdbData.Plot : null,
              language: imdbData.Language !== 'N/A' ? imdbData.Language : null,
              country: imdbData.Country !== 'N/A' ? imdbData.Country : null,
              posterUrl: imdbData.Poster !== 'N/A' ? imdbData.Poster : null,
              rating: imdbData.imdbRating !== 'N/A' ? parseFloat(imdbData.imdbRating) : null,
              runtime: imdbData.Runtime !== 'N/A' ? parseInt(imdbData.Runtime) : null,
              year: imdbData.Year !== 'N/A' ? parseInt(imdbData.Year) : null,
              contentRating: imdbData.Rated !== 'N/A' ? imdbData.Rated : null
            };
            fetchedAny = true;
          }
        } catch (error) {
          console.log(`Failed to fetch IMDB data for ID ${imdbId}:`, error);
        }
      }

      // Determine source type
      if (externalDataSources.tmdb && externalDataSources.imdb) {
        sourceType = 'HYBRID';
        enriched++;
      } else if (externalDataSources.tmdb) {
        sourceType = 'TMDB';
        enriched++;
      } else if (externalDataSources.imdb) {
        sourceType = 'IMDB';
        enriched++;
      }

      // Merge data from all sources (CSV > TMDB > IMDB)
      const mergedData: any = existing ? { ...existing } : {};

      // Helper to get first non-null value
      const firstValue = (...values: any[]) => values.find(v => v !== null && v !== undefined) || null;

      const movieData: any = {
        title,
        originalTitle: firstValue(row.originalTitle, row.original_title, row.originalName, externalDataSources.tmdb?.originalTitle, externalDataSources.imdb?.originalTitle, mergedData?.originalTitle),
        year: firstValue(year, externalDataSources.tmdb?.year, externalDataSources.imdb?.year, mergedData?.year),
        runtime: firstValue(runtime, externalDataSources.tmdb?.runtime, externalDataSources.imdb?.runtime, mergedData?.runtime),
        plot: firstValue(row.plot, row.Plot, row.overview, row.description, externalDataSources.tmdb?.plot, externalDataSources.imdb?.plot, mergedData?.plot),
        tagline: firstValue(row.tagline, row.Tagline, externalDataSources.tmdb?.tagline, mergedData?.tagline),
        language: firstValue(row.language, row.Language, row.original_language, externalDataSources.tmdb?.language, externalDataSources.imdb?.language, mergedData?.language),
        country: firstValue(row.country, row.Country, externalDataSources.imdb?.country, mergedData?.country),
        posterUrl: firstValue(row.posterUrl, row.poster_url, row.Poster, externalDataSources.tmdb?.posterUrl, externalDataSources.imdb?.posterUrl, mergedData?.posterUrl),
        backdropUrl: firstValue(row.backdropUrl, row.backdrop_url, externalDataSources.tmdb?.backdropUrl, mergedData?.backdropUrl),
        contentRating: firstValue(row.contentRating, row.rated, externalDataSources.tmdb?.contentRating, externalDataSources.imdb?.contentRating, mergedData?.contentRating),
        sourceType: existing ? (existing.sourceType === 'MANUAL' && fetchedAny ? sourceType : (fetchedAny ? 'HYBRID' : existing.sourceType)) : sourceType,
        rating: firstValue(rating, externalDataSources.tmdb?.rating, externalDataSources.imdb?.rating, mergedData?.rating)
      };

      // Create or update the movie
      const movie = existing
        ? await prisma.movie.update({
            where: { id: existing.id },
            data: movieData
          })
        : await prisma.movie.create({
            data: movieData
          });

      // Create/update ExternalMatch records for TMDB
      if (tmdbId && tmdbId !== '') {
        await prisma.externalMatch.upsert({
          where: {
            movieId_source: {
              movieId: movie.id,
              source: 'TMDB'
            }
          },
          create: {
            movieId: movie.id,
            source: 'TMDB',
            externalId: tmdbId.toString(),
            url: `https://www.themoviedb.org/movie/${tmdbId}`,
            rating: externalDataSources.tmdb?.rating || null,
            voteCount: null
          },
          update: {
            externalId: tmdbId.toString(),
            url: `https://www.themoviedb.org/movie/${tmdbId}`,
            rating: externalDataSources.tmdb?.rating || null
          }
        });
      }

      // Create/update ExternalMatch records for IMDB
      if (imdbId && imdbId !== '') {
        await prisma.externalMatch.upsert({
          where: {
            movieId_source: {
              movieId: movie.id,
              source: 'IMDB'
            }
          },
          create: {
            movieId: movie.id,
            source: 'IMDB',
            externalId: imdbId,
            url: `https://www.imdb.com/title/${imdbId}/`,
            rating: externalDataSources.imdb?.rating || null,
            voteCount: null
          },
          update: {
            externalId: imdbId,
            url: `https://www.imdb.com/title/${imdbId}/`,
            rating: externalDataSources.imdb?.rating || null
          }
        });
      }

      // If physical media data is present, create a Copy record
      const hasPhysicalData =
        row.physicalFormat || row.format || row.Format ||
        row.distributor || row.Distributor ||
        row.upc || row.UPC || row.barcode ||
        row.edition || row.Edition ||
        row.region || row.Region ||
        row.condition || row.Condition ||
        row.notes || row.Notes;

      if (hasPhysicalData) {
        await prisma.copy.create({
          data: {
            movieId: movie.id,
            format: row.physicalFormat || row.format || row.Format || null,
            edition: row.edition || row.Edition || null,
            region: row.region || row.Region || null,
            distributor: row.distributor || row.Distributor || null,
            upc: row.upc || row.UPC || row.barcode || null,
            condition: row.condition || row.Condition || null,
            notes: row.notes || row.Notes || null
          }
        });
      }

      imported++;
    } catch (error: any) {
      errors.push({ row, error: error.message });
      skipped++;
    }
  }

  res.json({
    success: true,
    imported,
    skipped,
    enriched,
    total: results.length,
    errors: errors.length > 0 ? errors.slice(0, 10) : [] // Only return first 10 errors
  });
});

export const downloadTemplate = asyncHandler(async (req: Request, res: Response) => {
  const csv = `title,originalTitle,year,runtime,plot,tagline,language,country,posterUrl,physicalFormat,distributor,upc,notes,rating
The Matrix,The Matrix,1999,136,"A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",Welcome to the Real World,English,USA,,,Warner Bros,,,8.7
Inception,Inception,2010,148,"A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",Your mind is the scene of the crime,English,USA,,,Warner Bros,,,8.8`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=cmdb-template.csv');
  res.send(csv);
});
