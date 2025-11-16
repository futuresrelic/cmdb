#!/bin/bash

# Script to clear all movie data from the database
# This will delete all movies, copies, external matches, etc.

echo "⚠️  WARNING: This will delete ALL movie data from the database!"
echo "This action cannot be undone."
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Clearing database..."

# Execute SQL commands to clear data
docker exec -i cmdb-postgres psql -U cmdb -d cmdb <<EOF
DELETE FROM "Copy";
DELETE FROM "ExternalMatch";
DELETE FROM "MovieGenre";
DELETE FROM "MoviePerson";
DELETE FROM "Person";
DELETE FROM "Genre";
DELETE FROM "Movie";
EOF

echo "✓ Database cleared successfully!"
echo "You can now re-import your CSV file."
