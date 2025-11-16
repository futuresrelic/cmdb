import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const getAllMovies = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    year,
    sourceType,
    genre,
    minRating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 50,
    offset = 0
  } = req.query;

  const where: Prisma.MovieWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { originalTitle: { contains: String(search), mode: 'insensitive' } }
    ];
  }

  if (year) {
    where.year = parseInt(String(year));
  }

  if (sourceType) {
    where.sourceType = String(sourceType) as any;
  }

  if (genre) {
    where.movieGenres = {
      some: {
        genre: {
          name: { contains: String(genre), mode: 'insensitive' }
        }
      }
    };
  }

  if (minRating) {
    where.rating = { gte: parseFloat(String(minRating)) };
  }

  // Build orderBy
  const orderBy: any = {};
  const sortField = String(sortBy);
  const order = String(sortOrder) === 'asc' ? 'asc' : 'desc';

  if (sortField === 'title' || sortField === 'year' || sortField === 'rating' || sortField === 'createdAt') {
    orderBy[sortField] = order;
  } else {
    orderBy.createdAt = 'desc';
  }

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      include: {
        externalMatches: true,
        movieGenres: {
          include: {
            genre: true
          }
        },
        moviePeople: {
          include: {
            person: true
          },
          where: {
            role: { in: ['DIRECTOR', 'ACTOR'] }
          },
          take: 5
        },
        copies: true
      },
      orderBy,
      take: parseInt(String(limit)),
      skip: parseInt(String(offset))
    }),
    prisma.movie.count({ where })
  ]);

  res.json({
    movies,
    total,
    limit: parseInt(String(limit)),
    offset: parseInt(String(offset))
  });
});

export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      externalMatches: true,
      movieGenres: {
        include: {
          genre: true
        }
      },
      moviePeople: {
        include: {
          person: true
        },
        orderBy: { order: 'asc' }
      },
      copies: true
    }
  });

  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  res.json(movie);
});

export const createMovie = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    originalTitle,
    year,
    runtime,
    plot,
    tagline,
    language,
    country,
    posterUrl,
    backdropUrl,
    sourceType = 'MANUAL',
    rating,
    genres,
    people,
    // Copy-related fields (optional)
    physicalFormat,
    edition,
    region,
    distributor,
    upc,
    condition,
    notes
  } = req.body;

  if (!title) {
    throw new AppError('Title is required', 400);
  }

  const movie = await prisma.movie.create({
    data: {
      title,
      originalTitle,
      year: year ? parseInt(year) : null,
      runtime: runtime ? parseInt(runtime) : null,
      plot,
      tagline,
      language,
      country,
      posterUrl,
      backdropUrl,
      sourceType,
      rating: rating ? parseFloat(rating) : null,
      movieGenres: genres
        ? {
            create: genres.map((genreId: string) => ({
              genre: { connect: { id: genreId } }
            }))
          }
        : undefined,
      moviePeople: people
        ? {
            create: people.map((p: any) => ({
              person: { connect: { id: p.personId } },
              role: p.role,
              character: p.character,
              order: p.order
            }))
          }
        : undefined
    },
    include: {
      externalMatches: true,
      movieGenres: {
        include: {
          genre: true
        }
      },
      moviePeople: {
        include: {
          person: true
        }
      }
    }
  });

  // If physical media data is provided, create a Copy record
  if (physicalFormat || distributor || upc || edition || region || condition || notes) {
    await prisma.copy.create({
      data: {
        movieId: movie.id,
        format: physicalFormat || null,
        edition: edition || null,
        region: region || null,
        distributor: distributor || null,
        upc: upc || null,
        condition: condition || null,
        notes: notes || null
      }
    });
  }

  res.status(201).json(movie);
});

export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove relationships from update data (handle separately if needed)
  delete updateData.genres;
  delete updateData.people;
  delete updateData.externalMatches;

  // Convert numeric fields
  if (updateData.year) updateData.year = parseInt(updateData.year);
  if (updateData.runtime) updateData.runtime = parseInt(updateData.runtime);
  if (updateData.rating) updateData.rating = parseFloat(updateData.rating);

  const movie = await prisma.movie.update({
    where: { id },
    data: updateData,
    include: {
      externalMatches: true,
      movieGenres: {
        include: {
          genre: true
        }
      },
      moviePeople: {
        include: {
          person: true
        }
      }
    }
  });

  res.json(movie);
});

export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.movie.delete({
    where: { id }
  });

  res.status(204).send();
});

export const addExternalMatch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { source, externalId, url, rating, voteCount } = req.body;

  if (!source || !externalId) {
    throw new AppError('Source and externalId are required', 400);
  }

  const externalMatch = await prisma.externalMatch.create({
    data: {
      movieId: id,
      source,
      externalId,
      url,
      rating: rating ? parseFloat(rating) : null,
      voteCount: voteCount ? parseInt(voteCount) : null
    }
  });

  res.status(201).json(externalMatch);
});
