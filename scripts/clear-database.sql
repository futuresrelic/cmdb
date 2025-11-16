-- Clear all movie data while preserving the schema
-- Run this in the database to start fresh

-- Delete all data in dependent tables first (foreign key constraints)
DELETE FROM "Copy";
DELETE FROM "ExternalMatch";
DELETE FROM "MovieGenre";
DELETE FROM "MoviePerson";
DELETE FROM "Person";
DELETE FROM "Genre";
DELETE FROM "Movie";

-- Reset sequences if needed
-- (PostgreSQL auto-increment will continue from where it left off unless reset)
