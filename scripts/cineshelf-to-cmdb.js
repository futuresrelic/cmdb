#!/usr/bin/env node

/**
 * CineShelf JSON to CMDB CSV Converter
 *
 * Converts a CineShelf JSON export to CMDB-compatible CSV format
 *
 * Usage:
 *   node cineshelf-to-cmdb.js <input.json> <output.csv>
 */

const fs = require('fs');
const path = require('path');

// Helper to escape CSV values
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Map CineShelf movie data to CMDB CSV format
function mapMovieToCSV(item) {
  const movie = item.movie;

  // Get the first copy for physical details (or use movie data as fallback)
  const copy = item.copies && item.copies.length > 0 ? item.copies[0] : movie;

  return {
    title: movie.title || '',
    originalTitle: movie.display_title || movie.title || '',
    year: movie.year || '',
    runtime: movie.runtime || '',
    plot: movie.overview || '',
    tagline: '', // CineShelf doesn't have tagline
    language: '', // CineShelf doesn't have language info
    country: '', // CineShelf doesn't have country info
    posterUrl: movie.poster_url || '',
    physicalFormat: copy.format || '',
    distributor: '', // CineShelf doesn't have distributor info
    upc: copy.barcode || '',
    notes: copy.notes || '',
    rating: movie.rating || '',
    // Extra CineShelf-specific fields (optional, won't be imported but can be useful)
    tmdb_id: movie.tmdb_id || '',
    director: movie.director || '',
    genre: movie.genre || '',
    certification: movie.certification || '',
    edition: copy.edition || '',
    region: copy.region || '',
    condition: copy.condition || ''
  };
}

// Main conversion function
function convertCineShelfToCSV(inputFile, outputFile) {
  try {
    // Read and parse JSON
    console.log(`Reading ${inputFile}...`);
    const jsonData = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(jsonData);

    if (!data.collection || !Array.isArray(data.collection)) {
      throw new Error('Invalid CineShelf JSON format: missing "collection" array');
    }

    console.log(`Found ${data.collection.length} movies in collection`);

    // CMDB CSV header
    const headers = [
      'title', 'originalTitle', 'year', 'runtime', 'plot', 'tagline',
      'language', 'country', 'posterUrl', 'physicalFormat', 'distributor',
      'upc', 'notes', 'rating'
    ];

    // Optional extra headers for CineShelf-specific data
    const extraHeaders = [
      'tmdb_id', 'director', 'genre', 'certification',
      'edition', 'region', 'condition'
    ];

    const allHeaders = [...headers, ...extraHeaders];

    // Convert each movie
    const csvRows = [allHeaders.join(',')];

    for (const item of data.collection) {
      const movieData = mapMovieToCSV(item);
      const row = allHeaders.map(header => escapeCSV(movieData[header]));
      csvRows.push(row.join(','));
    }

    // Write CSV
    const csvContent = csvRows.join('\n');
    fs.writeFileSync(outputFile, csvContent, 'utf8');

    console.log(`✓ Successfully converted ${data.collection.length} movies`);
    console.log(`✓ Output saved to: ${outputFile}`);
    console.log(`\nYou can now import this CSV file into CMDB via the Import page.`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('CineShelf JSON to CMDB CSV Converter\n');
    console.log('Usage:');
    console.log('  node cineshelf-to-cmdb.js <input.json> <output.csv>');
    console.log('\nExample:');
    console.log('  node cineshelf-to-cmdb.js my-cineshelf-export.json movies.csv');
    process.exit(1);
  }

  const [inputFile, outputFile] = args;

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  convertCineShelfToCSV(inputFile, outputFile);
}

module.exports = { convertCineShelfToCSV };
