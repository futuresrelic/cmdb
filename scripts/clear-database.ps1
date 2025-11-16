# Script to clear all movie data from the database
# This will delete all movies, copies, external matches, etc.

Write-Host "WARNING: This will delete ALL movie data from the database!" -ForegroundColor Yellow
Write-Host "This action cannot be undone." -ForegroundColor Yellow
$confirm = Read-Host "Are you sure you want to continue? (type 'yes' to confirm)"

if ($confirm -ne "yes") {
    Write-Host "Operation cancelled." -ForegroundColor Green
    exit 0
}

Write-Host "Clearing database..." -ForegroundColor Cyan

# Execute SQL commands to clear data
$sql = @"
DELETE FROM "Copy";
DELETE FROM "ExternalMatch";
DELETE FROM "MovieGenre";
DELETE FROM "MoviePerson";
DELETE FROM "Person";
DELETE FROM "Genre";
DELETE FROM "Movie";
"@

$sql | docker exec -i cmdb-postgres psql -U cmdb -d cmdb

Write-Host "Database cleared successfully!" -ForegroundColor Green
Write-Host "You can now re-import your CSV file." -ForegroundColor Green
