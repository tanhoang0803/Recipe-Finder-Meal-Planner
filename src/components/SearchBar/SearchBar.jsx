import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRecipeSearch } from '../../hooks/useRecipeSearch';
import { fetchByIngredients } from '../../store/recipesSlice';
export default function SearchBar() {
  const dispatch             = useDispatch();
  const { search, clear }    = useRecipeSearch();
  const [query, setQuery]    = useState('');
  const [mode, setMode]      = useState('name'); // 'name' | 'ingredients'
  const [cuisine, setCuisine] = useState('');

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (mode === 'name') {
      search(val, cuisine ? { cuisine } : {});
    }
  }

  function handleIngredientSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const list = query.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    dispatch(fetchByIngredients(list));
  }

  function handleClear() {
    setQuery('');
    clear();
  }

  const cuisines = ['', 'Italian', 'Asian', 'American', 'Mexican', 'Mediterranean', 'Indian'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Recipes</h1>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        {['name', 'ingredients'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); handleClear(); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${mode === m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            By {m}
          </button>
        ))}
      </div>

      {mode === 'name' ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search recipes (e.g. pasta, chicken stir fry...)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
          </div>
          <select
            value={cuisine}
            onChange={(e) => { setCuisine(e.target.value); if (query) search(query, e.target.value ? { cuisine: e.target.value } : {}); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {cuisines.map((c) => <option key={c} value={c}>{c || 'All cuisines'}</option>)}
          </select>
        </div>
      ) : (
        <form onSubmit={handleIngredientSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter ingredients (e.g. chicken, garlic, rice)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}
