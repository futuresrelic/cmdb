import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import type { Movie } from '../types';

function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMovie(id);
    }
  }, [id]);

  const loadMovie = async (movieId: string) => {
    try {
      setLoading(true);
      const data = await movieApi.getById(movieId);
      setMovie(data);
    } catch (error) {
      console.error('Failed to load movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this movie?')) return;

    try {
      await movieApi.delete(id);
      navigate('/browse');
    } catch (error) {
      console.error('Failed to delete movie:', error);
      alert('Failed to delete movie');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Movie not found</div>
      </div>
    );
  }

  const directors = movie.moviePeople?.filter((mp) => mp.role === 'DIRECTOR') || [];
  const actors = movie.moviePeople?.filter((mp) => mp.role === 'ACTOR') || [];
  const tmdbMatch = movie.externalMatches?.find(m => m.source === 'TMDB');
  const imdbMatch = movie.externalMatches?.find(m => m.source === 'IMDB');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/browse" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Browse
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 overflow-hidden relative group">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                style={{
                  transformOrigin: 'center center',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // Pan left/right based on mouse position
                  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20; // Pan up/down based on mouse position
                  e.currentTarget.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translate(0, 0)';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-8xl">🎬</span>
              </div>
            )}
          </div>

          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{movie.title}</h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-gray-600 italic mb-2">{movie.originalTitle}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/movie/${id}/edit`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              {movie.year && (
                <span className="bg-gray-100 px-3 py-1 rounded">{movie.year}</span>
              )}
              {movie.runtime && (
                <span className="bg-gray-100 px-3 py-1 rounded">{movie.runtime} min</span>
              )}
              {movie.contentRating && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded">{movie.contentRating}</span>
              )}
              <span
                className={`px-3 py-1 rounded ${
                  movie.sourceType === 'MANUAL'
                    ? 'bg-blue-100 text-blue-800'
                    : movie.sourceType === 'TMDB'
                    ? 'bg-green-100 text-green-800'
                    : movie.sourceType === 'IMDB'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {movie.sourceType}
              </span>
              {movie.rating && (
                <span className="bg-yellow-100 px-3 py-1 rounded">
                  ⭐ {movie.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* External IDs Section */}
            {movie.externalMatches && movie.externalMatches.length > 0 && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-3">External Sources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {tmdbMatch && (
                    <div className="border border-green-200 bg-green-50 p-3 rounded">
                      <div className="font-semibold text-green-800 mb-1">TMDB</div>
                      <a
                        href={tmdbMatch.url || `https://www.themoviedb.org/movie/${tmdbMatch.externalId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ID: {tmdbMatch.externalId}
                      </a>
                      {tmdbMatch.rating && (
                        <div className="text-sm text-gray-700 mt-1">Rating: {tmdbMatch.rating.toFixed(1)}</div>
                      )}
                    </div>
                  )}
                  {imdbMatch && (
                    <div className="border border-yellow-200 bg-yellow-50 p-3 rounded">
                      <div className="font-semibold text-yellow-800 mb-1">IMDB</div>
                      <a
                        href={imdbMatch.url || `https://www.imdb.com/title/${imdbMatch.externalId}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ID: {imdbMatch.externalId}
                      </a>
                      {imdbMatch.rating && (
                        <div className="text-sm text-gray-700 mt-1">Rating: {imdbMatch.rating.toFixed(1)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TMDB vs IMDB Comparison */}
            {(tmdbMatch || imdbMatch) && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-yellow-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Source Comparison</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* TMDB Column */}
                  <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                    <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center">
                      <span className="bg-green-600 text-white px-2 py-1 rounded mr-2 text-sm">TMDB</span>
                      The Movie Database
                    </h3>
                    {tmdbMatch ? (
                      <div className="space-y-3 text-sm">
                        {tmdbMatch.rating && (
                          <div>
                            <span className="font-semibold text-gray-700">Rating:</span>
                            <span className="ml-2 text-gray-900">⭐ {tmdbMatch.rating.toFixed(1)}/10</span>
                          </div>
                        )}
                        {tmdbMatch.runtime && (
                          <div>
                            <span className="font-semibold text-gray-700">Runtime:</span>
                            <span className="ml-2 text-gray-900">{tmdbMatch.runtime} minutes</span>
                          </div>
                        )}
                        {tmdbMatch.contentRating && (
                          <div>
                            <span className="font-semibold text-gray-700">Rating:</span>
                            <span className="ml-2 text-gray-900">{tmdbMatch.contentRating}</span>
                          </div>
                        )}
                        {tmdbMatch.language && (
                          <div>
                            <span className="font-semibold text-gray-700">Language:</span>
                            <span className="ml-2 text-gray-900">{tmdbMatch.language}</span>
                          </div>
                        )}
                        {tmdbMatch.plot && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="font-semibold text-gray-700 block mb-1">Plot:</span>
                            <p className="text-gray-700 text-sm leading-relaxed">{tmdbMatch.plot}</p>
                          </div>
                        )}
                        {!tmdbMatch.rating && !tmdbMatch.runtime && !tmdbMatch.plot && (
                          <p className="text-gray-500 italic">Limited data available</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No TMDB data</p>
                    )}
                  </div>

                  {/* IMDB Column */}
                  <div className="bg-white rounded-lg p-4 border-2 border-yellow-400">
                    <h3 className="text-lg font-bold text-yellow-700 mb-3 flex items-center">
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded mr-2 text-sm">IMDB</span>
                      Internet Movie Database
                    </h3>
                    {imdbMatch ? (
                      <div className="space-y-3 text-sm">
                        {imdbMatch.rating && (
                          <div>
                            <span className="font-semibold text-gray-700">Rating:</span>
                            <span className="ml-2 text-gray-900">⭐ {imdbMatch.rating.toFixed(1)}/10</span>
                          </div>
                        )}
                        {imdbMatch.runtime && (
                          <div>
                            <span className="font-semibold text-gray-700">Runtime:</span>
                            <span className="ml-2 text-gray-900">{imdbMatch.runtime} minutes</span>
                          </div>
                        )}
                        {imdbMatch.contentRating && (
                          <div>
                            <span className="font-semibold text-gray-700">Rated:</span>
                            <span className="ml-2 text-gray-900">{imdbMatch.contentRating}</span>
                          </div>
                        )}
                        {imdbMatch.language && (
                          <div>
                            <span className="font-semibold text-gray-700">Language:</span>
                            <span className="ml-2 text-gray-900">{imdbMatch.language}</span>
                          </div>
                        )}
                        {imdbMatch.country && (
                          <div>
                            <span className="font-semibold text-gray-700">Country:</span>
                            <span className="ml-2 text-gray-900">{imdbMatch.country}</span>
                          </div>
                        )}
                        {imdbMatch.plot && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="font-semibold text-gray-700 block mb-1">Plot:</span>
                            <p className="text-gray-700 text-sm leading-relaxed">{imdbMatch.plot}</p>
                          </div>
                        )}
                        {!imdbMatch.rating && !imdbMatch.runtime && !imdbMatch.plot && (
                          <p className="text-gray-500 italic">Limited data available</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No IMDB data</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {movie.tagline && (
              <p className="text-xl text-gray-600 italic mb-4">{movie.tagline}</p>
            )}

            {movie.plot && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Plot</h2>
                <p className="text-gray-700">{movie.plot}</p>
              </div>
            )}

            {movie.movieGenres && movie.movieGenres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.movieGenres.map((mg) => (
                    <span
                      key={mg.id}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded"
                    >
                      {mg.genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {directors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Director(s)</h2>
                <div className="space-y-1">
                  {directors.map((mp) => (
                    <p key={mp.id} className="text-gray-700">
                      {mp.person.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {actors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Cast</h2>
                <div className="space-y-1">
                  {actors.slice(0, 10).map((mp) => (
                    <p key={mp.id} className="text-gray-700">
                      {mp.person.name}
                      {mp.character && <span className="text-gray-500"> as {mp.character}</span>}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {movie.language && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Language</h2>
                <p className="text-gray-700">{movie.language}</p>
              </div>
            )}

            {movie.country && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Country</h2>
                <p className="text-gray-700">{movie.country}</p>
              </div>
            )}

            {/* Physical Copies Section */}
            {movie.copies && movie.copies.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Physical Copies ({movie.copies.length})</h2>
                <div className="space-y-4">
                  {movie.copies.map((copy) => (
                    <div key={copy.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-3">
                        {copy.format && (
                          <div>
                            <span className="font-semibold text-gray-700">Format:</span>{' '}
                            <span className="text-gray-900">{copy.format}</span>
                          </div>
                        )}
                        {copy.edition && (
                          <div>
                            <span className="font-semibold text-gray-700">Edition:</span>{' '}
                            <span className="text-gray-900">{copy.edition}</span>
                          </div>
                        )}
                        {copy.region && (
                          <div>
                            <span className="font-semibold text-gray-700">Region:</span>{' '}
                            <span className="text-gray-900">{copy.region}</span>
                          </div>
                        )}
                        {copy.distributor && (
                          <div>
                            <span className="font-semibold text-gray-700">Distributor:</span>{' '}
                            <span className="text-gray-900">{copy.distributor}</span>
                          </div>
                        )}
                        {copy.upc && (
                          <div>
                            <span className="font-semibold text-gray-700">UPC:</span>{' '}
                            <span className="text-gray-900">{copy.upc}</span>
                          </div>
                        )}
                        {copy.condition && (
                          <div>
                            <span className="font-semibold text-gray-700">Condition:</span>{' '}
                            <span className="text-gray-900">{copy.condition}</span>
                          </div>
                        )}
                        {copy.location && (
                          <div>
                            <span className="font-semibold text-gray-700">Location:</span>{' '}
                            <span className="text-gray-900">{copy.location}</span>
                          </div>
                        )}
                        {(copy.hasSlipcover || copy.isSealed) && (
                          <div className="md:col-span-2 flex gap-2">
                            {copy.hasSlipcover && (
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                                Has Slipcover
                              </span>
                            )}
                            {copy.isSealed && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                Sealed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {copy.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <span className="font-semibold text-gray-700">Notes:</span>
                          <p className="text-gray-700 whitespace-pre-wrap mt-1">{copy.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsPage;
