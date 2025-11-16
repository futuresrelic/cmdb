import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to CMDB
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Consumer Movie Database - Your personal catalog for movies that aren't found
          anywhere else. Perfect for rare releases, Quebec content, and regional DVDs.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold mb-3">Manual Entry</h2>
            <p className="text-gray-600 mb-4">
              Enter movie details directly from your physical media. Perfect for
              DVDs not in any database.
            </p>
            <Link
              to="/add"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Movie
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-3">Search External</h2>
            <p className="text-gray-600 mb-4">
              Find and import movies from TMDB and IMDB. Build your collection
              quickly.
            </p>
            <Link
              to="/search-external"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Search Now
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-bold mb-3">Browse Collection</h2>
            <p className="text-gray-600 mb-4">
              View and manage your entire movie collection. Search, filter, and
              organize.
            </p>
            <Link
              to="/browse"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Movies
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">📥</div>
            <h2 className="text-2xl font-bold mb-3">Import CSV</h2>
            <p className="text-gray-600 mb-4">
              Bulk import movies from CSV files. Perfect for migrating from
              CineShelf or other apps.
            </p>
            <Link
              to="/import-csv"
              className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Import CSV
            </Link>
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why CMDB?</h2>
          <div className="text-left max-w-3xl mx-auto space-y-4 text-gray-700">
            <p>
              <strong>🌍 For rare and regional content:</strong> Quebec films, independent releases,
              and content missing from mainstream databases.
            </p>
            <p>
              <strong>🔗 Connect to external sources:</strong> When available, link your movies to
              TMDB and IMDB for additional data.
            </p>
            <p>
              <strong>📀 Physical media tracking:</strong> Record details like format (DVD, Blu-ray),
              distributor, and UPC codes.
            </p>
            <p>
              <strong>🎯 Central repository:</strong> A single source of truth for all your movie
              data, integrating manual and external sources.
            </p>
            <p>
              <strong>📥 Bulk import:</strong> Import from CSV files - migrate from CineShelf or
              other apps in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
