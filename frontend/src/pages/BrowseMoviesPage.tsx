import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import type { Movie } from '../types';

function BrowseMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 60;

  useEffect(() => {
    loadMovies();
  }, [search, sourceFilter, sortBy, sortOrder, page]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        sortBy,
        sortOrder
      };
      if (search) params.search = search;
      if (sourceFilter) params.sourceType = sourceFilter;

      const data = await movieApi.getAll(params);
      setMovies(data.movies);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Browse Movies</h1>
        <div className="text-gray-600">
          {total} movie{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            <option value="MANUAL">Manual</option>
            <option value="TMDB">TMDB</option>
            <option value="IMDB">IMDB</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading movies...</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No movies found</p>
          <Link
            to="/add"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Movie
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {movie.posterUrl ? (
                    <div className="relative" style={{ aspectRatio: '2/3' }}>
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end">
                    <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{movie.title}</h3>
                      {movie.year && (
                        <p className="text-gray-300 text-xs mb-2">{movie.year}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            movie.sourceType === 'MANUAL'
                              ? 'bg-blue-500 text-white'
                              : movie.sourceType === 'TMDB'
                              ? 'bg-green-500 text-white'
                              : movie.sourceType === 'IMDB'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-purple-500 text-white'
                          }`}
                        >
                          {movie.sourceType}
                        </span>
                        {movie.rating && (
                          <span className="text-xs text-white font-semibold">
                            ⭐ {movie.rating.toFixed(1)}
                          </span>
                        )}
                        {movie.copies && movie.copies.length > 0 && (
                          <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">
                            📀 {movie.copies.length}
                          </span>
                        )}
                      </div>
                      {movie.externalMatches && movie.externalMatches.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {movie.externalMatches.map((match) => (
                            <span key={match.id} className="text-xs bg-gray-700 text-white px-1.5 py-0.5 rounded">
                              {match.source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {page > 3 && (
                  <>
                    <button
                      onClick={() => setPage(1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      1
                    </button>
                    {page > 4 && <span className="px-2">...</span>}
                  </>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  if (pageNum < 1 || pageNum > totalPages || (page <= 3 && pageNum > 5) || (page > totalPages - 3 && pageNum < totalPages - 4)) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg transition ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="px-2">...</span>}
                    <button
                      onClick={() => setPage(totalPages)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BrowseMoviesPage;
