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
    // Physical copy fields
    physicalFormat: '',
    edition: '',
    region: '',
    distributor: '',
    upc: '',
    condition: '',
    numberOfDiscs: undefined,
    languages: '',
    notes: '',
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
        // Physical copy fields - empty for adding new copy
        physicalFormat: '',
        edition: '',
        region: '',
        distributor: '',
        upc: '',
        condition: '',
        numberOfDiscs: undefined,
        languages: '',
        notes: '',
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
      const dataToSubmit: any = {
        title: formData.title,
        originalTitle: formData.originalTitle,
        year: formData.year,
        runtime: formData.runtime,
        plot: formData.plot,
        tagline: formData.tagline,
        language: formData.language,
        country: formData.country,
        posterUrl: formData.posterUrl,
        backdropUrl: formData.backdropUrl,
        rating: formData.rating,
        contentRating: formData.contentRating,
      };

      // Add physical copy fields if any are filled
      const hasPhysicalData = formData.physicalFormat || formData.edition || formData.region ||
                              formData.distributor || formData.upc || formData.condition ||
                              formData.numberOfDiscs || formData.languages || formData.notes;

      if (hasPhysicalData) {
        dataToSubmit.physicalFormat = formData.physicalFormat;
        dataToSubmit.edition = formData.edition;
        dataToSubmit.region = formData.region;
        dataToSubmit.distributor = formData.distributor;
        dataToSubmit.upc = formData.upc;
        dataToSubmit.condition = formData.condition;
        dataToSubmit.numberOfDiscs = formData.numberOfDiscs;
        dataToSubmit.languages = formData.languages;
        dataToSubmit.notes = formData.notes;
      }

      // Convert numeric fields
      if (dataToSubmit.year) dataToSubmit.year = parseInt(dataToSubmit.year);
      if (dataToSubmit.runtime) dataToSubmit.runtime = parseInt(dataToSubmit.runtime);
      if (dataToSubmit.rating) dataToSubmit.rating = parseFloat(dataToSubmit.rating);
      if (dataToSubmit.numberOfDiscs) dataToSubmit.numberOfDiscs = parseInt(dataToSubmit.numberOfDiscs);

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
      <p className="text-gray-600 mb-8">Update movie information and add physical copies</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Movie Information Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
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
                  {formData.posterUrl && (
                    <div className="mt-3">
                      <img
                        src={formData.posterUrl}
                        alt="Poster preview"
                        className="h-48 rounded shadow-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
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
                  {formData.backdropUrl && (
                    <div className="mt-3">
                      <img
                        src={formData.backdropUrl}
                        alt="Backdrop preview"
                        className="w-full rounded shadow-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Physical Copy Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 border-2 border-indigo-200">
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Add New Physical Copy</h2>
              <p className="text-sm text-indigo-700 mb-6">
                Fill in any of these fields to add a new physical copy of this movie to your collection
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format / Media Type
                  </label>
                  <select
                    name="physicalFormat"
                    value={formData.physicalFormat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select format...</option>
                    <option value="DVD">DVD</option>
                    <option value="Blu-ray">Blu-ray</option>
                    <option value="4K UHD">4K UHD Blu-ray</option>
                    <option value="VHS">VHS</option>
                    <option value="LaserDisc">LaserDisc</option>
                    <option value="Betamax">Betamax</option>
                    <option value="HD DVD">HD DVD</option>
                    <option value="Digital">Digital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edition Type
                  </label>
                  <select
                    name="edition"
                    value={formData.edition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select edition...</option>
                    <option value="Standard">Standard Edition</option>
                    <option value="Special Edition">Special Edition</option>
                    <option value="Collector's Edition">Collector's Edition</option>
                    <option value="Limited Edition">Limited Edition</option>
                    <option value="Director's Cut">Director's Cut</option>
                    <option value="Extended Cut">Extended Cut</option>
                    <option value="Theatrical Cut">Theatrical Cut</option>
                    <option value="Steelbook">Steelbook</option>
                    <option value="DigiBook">DigiBook</option>
                    <option value="Box Set">Box Set</option>
                    <option value="2-Film Collection">2-Film Collection</option>
                    <option value="3-Film Collection">3-Film Collection</option>
                    <option value="4-Film Collection">4-Film Collection</option>
                    <option value="TV Series">TV Series</option>
                    <option value="Anniversary Edition">Anniversary Edition</option>
                    <option value="Criterion Collection">Criterion Collection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select region...</option>
                    <option value="Region 1">Region 1 (US, Canada)</option>
                    <option value="Region 2">Region 2 (Europe, Japan)</option>
                    <option value="Region 3">Region 3 (Southeast Asia)</option>
                    <option value="Region 4">Region 4 (Australia, Latin America)</option>
                    <option value="Region 5">Region 5 (Africa, Russia)</option>
                    <option value="Region 6">Region 6 (China)</option>
                    <option value="Region A">Region A (Americas, East Asia)</option>
                    <option value="Region B">Region B (Europe, Africa)</option>
                    <option value="Region C">Region C (Asia, Russia)</option>
                    <option value="Region Free">Region Free / All Regions</option>
                    <option value="NTSC">NTSC</option>
                    <option value="PAL">PAL</option>
                    <option value="SECAM">SECAM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select condition...</option>
                    <option value="Sealed">Sealed / New</option>
                    <option value="Mint">Mint</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="For Parts">For Parts / Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distributor / Studio
                  </label>
                  <input
                    type="text"
                    name="distributor"
                    value={formData.distributor}
                    onChange={handleChange}
                    placeholder="Warner Bros, Universal, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPC / Barcode</label>
                  <input
                    type="text"
                    name="upc"
                    value={formData.upc}
                    onChange={handleChange}
                    placeholder="UPC barcode number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Discs
                  </label>
                  <input
                    type="number"
                    name="numberOfDiscs"
                    value={formData.numberOfDiscs || ''}
                    onChange={handleChange}
                    min="1"
                    placeholder="1, 2, 3..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Languages
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="English, Spanish, French..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes / Additional Details
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Special features, slipcover details, inserts, bonus content, packaging notes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/movie/${id}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
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

            {/* Existing Physical Copies Info */}
            {movie.copies && movie.copies.length > 0 && (
              <div className="mt-6 bg-white rounded-lg p-4 border-2 border-indigo-300">
                <h3 className="font-bold text-indigo-700 mb-2 text-sm">
                  Existing Copies ({movie.copies.length})
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  These copies are already in your collection
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {movie.copies.map((copy, idx) => (
                    <div key={copy.id} className="text-xs bg-indigo-50 p-2 rounded border border-indigo-200">
                      <div className="font-semibold text-indigo-900">Copy {idx + 1}</div>
                      {copy.format && <div className="text-gray-700">Format: {copy.format}</div>}
                      {copy.edition && <div className="text-gray-700">Edition: {copy.edition}</div>}
                      {copy.region && <div className="text-gray-700">Region: {copy.region}</div>}
                      {copy.condition && <div className="text-gray-700">Condition: {copy.condition}</div>}
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
