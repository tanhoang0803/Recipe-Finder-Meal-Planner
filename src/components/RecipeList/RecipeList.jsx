import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAISuggestions } from '../../store/recipesSlice';
import RecipeCard from '../RecipeCard/RecipeCard';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function RecipeList() {
  const dispatch = useDispatch();
  const { results, status, error } = useSelector((s) => s.recipes);
  const [ingredients, setIngredients] = useState('');
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState(null);

  async function handleAISuggest(e) {
    e.preventDefault();
    const list = ingredients.split(',').map((s) => s.trim()).filter(Boolean);
    if (!list.length) return;
    setAiLoading(true);
    setAiError(null);
    try {
      await dispatch(fetchAISuggestions(list)).unwrap();
    } catch (err) {
      setAiError(err);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div>
      {/* AI Suggest section */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6">
        <h2 className="text-base font-semibold text-purple-900 mb-1">AI Recipe Suggestions</h2>
        <p className="text-xs text-purple-600 mb-3">
          Enter ingredients you have and let AI suggest recipes.
        </p>
        <form onSubmit={handleAISuggest} className="flex gap-2">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. chicken, garlic, rice"
            className="flex-1 border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            {aiLoading ? 'Thinking…' : 'Suggest'}
          </button>
        </form>
        {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
      </div>

      {/* Results */}
      {status === 'loading' && <LoadingSpinner />}

      {status === 'failed' && (
        <p className="text-center text-red-600 text-sm py-8">{error}</p>
      )}

      {status === 'succeeded' && results.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-12">
          No recipes found. Try a different search.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {status === 'idle' && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽</p>
          <p className="text-sm">Search for recipes above or use AI suggestions.</p>
        </div>
      )}
    </div>
  );
}
