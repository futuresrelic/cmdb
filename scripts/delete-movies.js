#!/usr/bin/env node

/**
 * Delete movies from the database
 *
 * Usage:
 *   node delete-movies.js <id1> <id2> <id3> ...
 *   node delete-movies.js --pattern "search term"
 *   node delete-movies.js --all (delete ALL movies - use with caution!)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteMovies(args) {
  try {
    // Check for --all flag
    if (args.includes('--all')) {
      console.log('⚠️  WARNING: This will delete ALL movies from the database!');
      console.log('   Run "node list-movies.js" first to see what will be deleted.');
      console.log('   Press Ctrl+C within 5 seconds to cancel...\n');

      await new Promise(resolve => setTimeout(resolve, 5000));

      const count = await prisma.movie.count();
      await prisma.movie.deleteMany({});
      console.log(`✓ Deleted all ${count} movies from database`);
      return;
    }

    // Check for --pattern flag
    const patternIndex = args.indexOf('--pattern');
    if (patternIndex !== -1 && args[patternIndex + 1]) {
      const searchTerm = args[patternIndex + 1];

      const movies = await prisma.movie.findMany({
        where: {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          title: true,
          year: true
        }
      });

      if (movies.length === 0) {
        console.log(`No movies found matching pattern: "${searchTerm}"`);
        return;
      }

      console.log(`\n📋 Found ${movies.length} movies matching "${searchTerm}":\n`);
      for (const movie of movies) {
        console.log(`  ${movie.id}: ${movie.title} (${movie.year || 'N/A'})`);
      }

      console.log('\n⚠️  These movies will be deleted in 3 seconds...');
      console.log('   Press Ctrl+C to cancel\n');

      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = await prisma.movie.deleteMany({
        where: {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      });

      console.log(`✓ Deleted ${result.count} movies`);
      return;
    }

    // Delete by IDs
    if (args.length === 0) {
      console.log('Usage:');
      console.log('  node delete-movies.js <id1> <id2> <id3> ...');
      console.log('  node delete-movies.js --pattern "search term"');
      console.log('  node delete-movies.js --all');
      console.log('\nRun "node list-movies.js" to see available movies');
      return;
    }

    const ids = args.map(arg => parseInt(arg)).filter(id => !isNaN(id));

    if (ids.length === 0) {
      console.log('Error: No valid movie IDs provided');
      return;
    }

    // Show what will be deleted
    const movies = await prisma.movie.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        title: true,
        year: true
      }
    });

    if (movies.length === 0) {
      console.log('No movies found with the provided IDs');
      return;
    }

    console.log(`\n📋 Found ${movies.length} movies to delete:\n`);
    for (const movie of movies) {
      console.log(`  ${movie.id}: ${movie.title} (${movie.year || 'N/A'})`);
    }

    console.log('\n⚠️  These movies will be deleted in 3 seconds...');
    console.log('   Press Ctrl+C to cancel\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete the movies
    const result = await prisma.movie.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    console.log(`✓ Deleted ${result.count} movies`);

    // Show if any IDs were not found
    if (result.count < ids.length) {
      const deletedIds = movies.map(m => m.id);
      const notFound = ids.filter(id => !deletedIds.includes(id));
      console.log(`⚠️  IDs not found: ${notFound.join(', ')}`);
    }

  } catch (error) {
    console.error('Error deleting movies:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const args = process.argv.slice(2);
deleteMovies(args);
