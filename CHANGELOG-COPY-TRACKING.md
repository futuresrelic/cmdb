# Copy Tracking System - Implementation Guide

## Overview

This update adds support for tracking **multiple physical copies/editions** of the same movie. Previously, CMDB could only track one set of physical details per movie. Now you can track as many copies as you want (e.g., DVD Standard, DVD Special Edition, Blu-ray, 4K UHD, etc.).

## What's Changed

### 1. Database Schema ✅
- **New `Copy` model** added to track physical copies
- **Movie model updated** - physical media fields moved to Copy model
- **One-to-many relationship**: One movie can have many copies

### 2. Copy Model Fields

Each copy can track:
- **Format**: DVD, Blu-ray, VHS, LaserDisc, 4K UHD, etc.
- **Edition**: Standard, Special Edition, Director's Cut, Widescreen, Full Screen, etc.
- **Region**: Region 1, Region A, NTSC, PAL, etc.
- **Distributor**: Warner Bros, Universal, etc.
- **UPC/Barcode**
- **Purchase Date & Price**
- **Condition**: Mint, Excellent, Good, Fair, Poor
- **Location**: Where it's stored
- **Notes**: Free-form text
- **Special Features**: Has slipcover, is sealed, etc.

### 3. Data Migration

The migration script automatically:
- Creates the new `Copy` table
- Migrates existing physical media data from movies to copies
- Removes old physical media columns from Movie table

## Installation Steps

### ⚠️ IMPORTANT: Backup Your Database First!

```bash
# Backup your database
pg_dump cmdb > cmdb_backup_$(date +%Y%m%d).sql
```

### Step 1: Update Dependencies

```bash
cd backend
npm install
```

### Step 2: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_copy_tracking
```

This will:
1. Create the Copy table
2. Migrate existing data
3. Update the Prisma client

### Step 3: Restart Backend

If you're running the backend in development:
```bash
# Stop the current backend (Ctrl+C)
npm run dev
```

If you're running in Docker:
```bash
docker-compose restart backend
```

### Step 4: Update Frontend

The frontend has been updated but you'll need to rebuild:

```bash
cd frontend
npm install
npm run build  # For production
# OR
npm run dev    # For development
```

## What Works Now

### ✅ Completed Features

1. **Database Cleanup Tool**
   - `scripts/list-movies.js` - List all movies with IDs
   - `scripts/delete-movies.js` - Delete specific movies by ID or pattern

   Usage:
   ```bash
   cd scripts
   node list-movies.js
   node delete-movies.js 1 2 3              # Delete by IDs
   node delete-movies.js --pattern "test"   # Delete by title pattern
   ```

2. **Netflix-Style Movie Cards**
   - Poster aspect ratio (2:3)
   - Hover overlay with movie info
   - More responsive grid (up to 6 columns on large screens)

3. **CSV Import with TMDB/IMDB Enrichment**
   - Automatically fetches movie data from TMDB or IMDB if IDs are provided
   - Add `tmdb_id` or `imdb_id` columns to your CSV
   - System will auto-fetch posters, plot, ratings, etc.

4. **Copy Tracking Database Schema**
   - Prisma schema updated
   - Migration script created
   - Ready to track multiple copies per movie

## What's Coming Next (TODO)

### 🚧 Features to Implement

1. **Backend API for Copies**
   - Create copy endpoints (POST /api/movies/:id/copies)
   - Update copy endpoints (PUT /api/copies/:id)
   - Delete copy endpoints (DELETE /api/copies/:id)
   - List copies endpoint (GET /api/movies/:id/copies)

2. **Frontend UI for Copies**
   - Copy management interface on movie details page
   - Add/edit/delete copy forms
   - Display all copies with their details
   - Filter/search by copy format

3. **CSV Import Update**
   - Support importing multiple copies per movie
   - Handle copy-specific columns (format, edition, region, etc.)
   - Update cineshelf-to-cmdb.js converter

4. **Movie Card Updates**
   - Show copy count badge on movie cards
   - Display formats you own (DVD, Blu-ray icons)

## Testing the Migration

After running the migration, verify:

```bash
# Check if Copy table was created
psql cmdb -c "\d \"Copy\""

# Check if existing data was migrated
psql cmdb -c "SELECT COUNT(*) FROM \"Copy\";"

# Check a movie with its copies
psql cmdb -c "SELECT m.title, c.format, c.edition, c.upc FROM \"Movie\" m LEFT JOIN \"Copy\" c ON m.id = c.\"movieId\" LIMIT 10;"
```

## Rollback (If Needed)

If something goes wrong:

```bash
# Restore from backup
psql cmdb < cmdb_backup_YYYYMMDD.sql

# OR use Prisma migrate
npx prisma migrate reset
```

## Example: Multiple Copies

With this system, you can track:

**The Matrix (1999)**
- Copy 1: DVD, Widescreen Edition, Region 1, Warner Bros
- Copy 2: DVD, Full Screen Edition, Region 1, Warner Bros
- Copy 3: Blu-ray, Special Edition, Region A, Warner Bros
- Copy 4: 4K UHD, Ultimate Collector's Edition, Region Free, Warner Bros

Each copy can have its own:
- Condition
- Purchase price/date
- UPC (different editions have different UPCs)
- Location
- Notes

## Benefits

1. **Complete Collection Tracking**: Track every physical copy you own
2. **Edition Management**: Distinguish between different editions
3. **Community Data**: Users can add copy details without affecting the main movie entry
4. **Better Matching**: External platforms (like CineShelf) can match specific copies
5. **Collection Value**: Track purchase prices and conditions for insurance/resale

## Questions?

If you need help or have questions about this update, create an issue on GitHub.

---

**Next Steps:** Once you run the migration, I'll implement the API endpoints and UI for managing copies!
