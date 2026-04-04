import { useSelector } from 'react-redux';
import RecipeCard from '../RecipeCard/RecipeCard';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function FavoritesPage() {
  const { items, status } = useSelector((s) => s.favorites);

  if (status === 'loading') return <LoadingSpinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">♡</p>
          <p className="text-sm">No saved recipes yet.</p>
          <p className="text-xs mt-1">Search for recipes and click the heart to save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
