# CineShelf to UMDB Converter

Converts CineShelf JSON exports to UMDB-compatible CSV format.

## Problem

CineShelf exports movie collections as JSON files, but UMDB imports data via CSV. This tool bridges the gap by converting the JSON export to the proper CSV format expected by UMDB.

## Usage

### Step 1: Export from CineShelf

In CineShelf, export your collection to get a JSON file (e.g., `my-collection.json`)

### Step 2: Convert to CSV

```bash
cd scripts
node cineshelf-to-umdb.js <input.json> <output.csv>
```

**Example:**
```bash
node cineshelf-to-umdb.js my-cineshelf-export.json movies.csv
```

### Step 3: Import to UMDB

1. Open UMDB in your browser
2. Go to "Import CSV" page
3. Upload the generated CSV file
4. Review import results

## Field Mapping

The converter maps CineShelf fields to UMDB fields as follows:

| CineShelf Field | UMDB Field | Notes |
|----------------|------------|-------|
| `title` | `title` | Required |
| `display_title` | `originalTitle` | Falls back to title if not set |
| `year` | `year` | |
| `runtime` | `runtime` | In minutes |
| `overview` | `plot` | Movie description |
| `poster_url` | `posterUrl` | Poster image URL |
| `format` | `physicalFormat` | DVD, Blu-ray, etc. |
| `barcode` | `upc` | Barcode/UPC code |
| `notes` | `notes` | Personal notes |
| `rating` | `rating` | Movie rating |

### Additional Fields (Preserved)

These CineShelf-specific fields are included in the CSV but won't be imported to UMDB (they're for reference):

- `tmdb_id` - TMDB ID for reference
- `director` - Director name
- `genre` - Genres
- `certification` - Rating (G, PG, R, etc.)
- `edition` - Special edition info
- `region` - DVD region
- `condition` - Physical condition

## Example

**Input (JSON):**
```json
{
  "user": "klindakoil",
  "exported": "2025-11-16T08:18:29.795Z",
  "collection": [
    {
      "movie": {
        "title": "2001: A Space Odyssey",
        "year": 1968,
        "runtime": 149,
        "format": "DVD",
        "rating": 8.065,
        "overview": "Humanity finds a mysterious object...",
        ...
      },
      "copies": [...]
    }
  ]
}
```

**Output (CSV):**
```csv
title,originalTitle,year,runtime,plot,tagline,language,country,posterUrl,physicalFormat,distributor,upc,notes,rating,...
2001: A Space Odyssey,2001: A Space Odyssey,1968,149,"Humanity finds a mysterious object...",,,,https://...,DVD,,,,8.065,...
```

## Testing

A test sample is included:

```bash
node cineshelf-to-umdb.js test-cineshelf-sample.json test-output.csv
```

## Troubleshooting

### Error: "Invalid CineShelf JSON format"
- Make sure your file is a valid CineShelf export with a `collection` array
- Verify the JSON is properly formatted (use a JSON validator)

### Movies not importing in UMDB
- Check that the CSV has a `title` column (required)
- Verify the CSV is properly formatted (open in Excel/Sheets)
- Check UMDB import page for specific error messages

### Duplicate movies skipped
- UMDB skips movies that already exist (based on title + year)
- This is normal behavior to prevent duplicates

## Notes

- The converter handles multiple copies per movie (uses the first copy for physical details)
- Empty fields are left blank in the CSV
- Special characters in text are properly escaped for CSV format
- All CineShelf movies should successfully convert

## Support

If you encounter issues:
1. Check that your CineShelf export is valid JSON
2. Verify the script ran without errors
3. Inspect the generated CSV file
4. Check UMDB import logs for specific errors
