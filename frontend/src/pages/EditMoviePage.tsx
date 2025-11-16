import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import type { Movie } from '../types';

function EditMoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    originalTitle: '',
    year: undefined,
    runtime: undefined,
    plot: '',
    tagline: '',
    language: '',
    country: '',
    posterUrl: '',
    backdropUrl: '',
    rating: undefined,
    contentRating: '',
  });

  useEffect(() => {
    if (id) {
      loadMovie(id);
    }
  }, [id]);

  const loadMovie = async (movieId: string) => {
    try {
      setLoadingMovie(true);
      const data = await movieApi.getById(movieId);
      setMovie(data);

      // Pre-fill form with movie data
      setFormData({
        title: data.title || '',
        originalTitle: data.originalTitle || '',
        year: data.year || undefined,
        runtime: data.runtime || undefined,
        plot: data.plot || '',
        tagline: data.tagline || '',
        language: data.language || '',
        country: data.country || '',
        posterUrl: data.posterUrl || '',
        backdropUrl: data.backdropUrl || '',
        rating: data.rating || undefined,
        contentRating: data.contentRating || '',
      });
    } catch (error) {
      console.error('Failed to load movie:', error);
      alert('Failed to load movie');
      navigate('/browse');
    } finally {
      setLoadingMovie(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!id) return;

    try {
      setLoading(true);
      const dataToSubmit: any = { ...formData };

      // Convert numeric fields
      if (dataToSubmit.year) dataToSubmit.year = parseInt(dataToSubmit.year);
      if (dataToSubmit.runtime) dataToSubmit.runtime = parseInt(dataToSubmit.runtime);
      if (dataToSubmit.rating) dataToSubmit.rating = parseFloat(dataToSubmit.rating);

      // Remove empty strings
      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key] === '') {
          dataToSubmit[key] = undefined;
        }
      });

      await movieApi.update(id, dataToSubmit);
      navigate(`/movie/${id}`);
    } catch (error) {
      console.error('Failed to update movie:', error);
      alert('Failed to update movie');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMovie) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Loading movie data...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Movie not found</div>
      </div>
    );
  }

  const tmdbMatch = movie.externalMatches?.find(m => m.source === 'TMDB');
  const imdbMatch = movie.externalMatches?.find(m => m.source === 'IMDB');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/movie/${id}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Movie Details
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Movie</h1>
      <p className="text-gray-600 mb-8">Update movie information and metadata</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Movie Information</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Title
                </label>
                <input
                  type="text"
                  name="originalTitle"
                  value={formData.originalTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runtime (minutes)
                </label>
                <input
                  type="number"
                  name="runtime"
                  value={formData.runtime || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (0-10)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating || ''}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Rating
                </label>
                <input
                  type="text"
                  name="contentRating"
                  value={formData.contentRating}
                  onChange={handleChange}
                  placeholder="G, PG, PG-13, R, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot</label>
                <textarea
                  name="plot"
                  value={formData.plot}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poster URL
                </label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backdrop URL
                </label>
                <input
                  type="url"
                  name="backdropUrl"
                  value={formData.backdropUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/movie/${id}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Reference Data Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reference Data</h2>
            <p className="text-sm text-gray-600 mb-6">
              Use this data from external sources as reference when editing
            </p>

            {/* TMDB Data */}
            {tmdbMatch && (
              <div className="mb-6 bg-white rounded-lg p-4 border-2 border-green-300">
                <h3 className="font-bold text-green-700 mb-3 flex items-center text-sm">
                  <span className="bg-green-600 text-white px-2 py-1 rounded mr-2 text-xs">TMDB</span>
                  The Movie Database
                </h3>
                <div className="space-y-2 text-xs">
                  {tmdbMatch.rating && (
                    <div><span className="font-semibold">Rating:</span> {tmdbMatch.rating.toFixed(1)}/10</div>
                  )}
                  {tmdbMatch.runtime && (
                    <div><span className="font-semibold">Runtime:</span> {tmdbMatch.runtime} min</div>
                  )}
                  {tmdbMatch.language && (
                    <div><span className="font-semibold">Language:</span> {tmdbMatch.language}</div>
                  )}
                  {tmdbMatch.plot && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="font-semibold block mb-1">Plot:</span>
                      <p className="text-gray-700 leading-relaxed">{tmdbMatch.plot}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* IMDB Data */}
            {imdbMatch && (
              <div className="mb-6 bg-white rounded-lg p-4 border-2 border-yellow-400">
                <h3 className="font-bold text-yellow-700 mb-3 flex items-center text-sm">
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded mr-2 text-xs">IMDB</span>
                  Internet Movie Database
                </h3>
                <div className="space-y-2 text-xs">
                  {imdbMatch.rating && (
                    <div><span className="font-semibold">Rating:</span> {imdbMatch.rating.toFixed(1)}/10</div>
                  )}
                  {imdbMatch.runtime && (
                    <div><span className="font-semibold">Runtime:</span> {imdbMatch.runtime} min</div>
                  )}
                  {imdbMatch.contentRating && (
                    <div><span className="font-semibold">Rated:</span> {imdbMatch.contentRating}</div>
                  )}
                  {imdbMatch.language && (
                    <div><span className="font-semibold">Language:</span> {imdbMatch.language}</div>
                  )}
                  {imdbMatch.country && (
                    <div><span className="font-semibold">Country:</span> {imdbMatch.country}</div>
                  )}
                  {imdbMatch.plot && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="font-semibold block mb-1">Plot:</span>
                      <p className="text-gray-700 leading-relaxed">{imdbMatch.plot}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!tmdbMatch && !imdbMatch && (
              <p className="text-gray-500 italic text-sm">No external reference data available</p>
            )}

            {/* Physical Copies Info */}
            {movie.copies && movie.copies.length > 0 && (
              <div className="mt-6 bg-white rounded-lg p-4 border-2 border-indigo-300">
                <h3 className="font-bold text-indigo-700 mb-2 text-sm">
                  Physical Copies ({movie.copies.length})
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Physical media copies are managed separately. This form only updates movie metadata.
                </p>
                <div className="space-y-2">
                  {movie.copies.map((copy, idx) => (
                    <div key={copy.id} className="text-xs bg-indigo-50 p-2 rounded">
                      <span className="font-semibold">Copy {idx + 1}:</span> {copy.format || 'Unknown Format'}
                      {copy.edition && ` - ${copy.edition}`}
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

export default EditMoviePage;
