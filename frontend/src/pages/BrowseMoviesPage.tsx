import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import type { Movie } from '../types';

function BrowseMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    loadMovies();
  }, [search, sourceFilter]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (sourceFilter) params.sourceType = sourceFilter;

      const data = await movieApi.getAll(params);
      setMovies(data.movies);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Browse Movies</h1>

      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Sources</option>
          <option value="MANUAL">Manual</option>
          <option value="TMDB">TMDB</option>
          <option value="IMDB">IMDB</option>
        </select>
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
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {movie.sourceType}
                      </span>
                      {movie.rating && (
                        <span className="text-xs text-white font-semibold">
                          ⭐ {movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseMoviesPage;
