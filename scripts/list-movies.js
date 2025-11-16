#!/usr/bin/env node

/**
 * List all movies in the database with their IDs
 * Useful for identifying movies to delete
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listMovies() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: [
        { title: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        year: true,
        physicalFormat: true,
        sourceType: true,
        createdAt: true
      }
    });

    console.log(`\n📋 Found ${movies.length} movies in database:\n`);
    console.log('ID'.padEnd(6) + 'Title'.padEnd(50) + 'Year'.padEnd(8) + 'Format'.padEnd(15) + 'Source'.padEnd(12) + 'Created');
    console.log('-'.repeat(120));

    for (const movie of movies) {
      const id = String(movie.id).padEnd(6);
      const title = (movie.title || 'Untitled').substring(0, 48).padEnd(50);
      const year = String(movie.year || '----').padEnd(8);
      const format = (movie.physicalFormat || 'N/A').substring(0, 13).padEnd(15);
      const source = (movie.sourceType || 'N/A').substring(0, 10).padEnd(12);
      const created = movie.createdAt.toISOString().split('T')[0];

      console.log(`${id}${title}${year}${format}${source}${created}`);
    }

    console.log('\n💡 To delete specific movies, use:');
    console.log('   node delete-movies.js <id1> <id2> <id3> ...');
    console.log('   Example: node delete-movies.js 1 2 3\n');
    console.log('💡 To delete movies by title pattern, use:');
    console.log('   node delete-movies.js --pattern "search term"\n');

  } catch (error) {
    console.error('Error listing movies:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listMovies();
