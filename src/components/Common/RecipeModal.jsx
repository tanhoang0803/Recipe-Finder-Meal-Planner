import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipeById, setSelectedRecipe } from '../../store/recipesSlice';
import { addFavorite, removeFavorite } from '../../store/favoritesSlice';
import { useToast } from './Toast';
import LoadingSpinner from './LoadingSpinner';

export default function RecipeModal({ recipeId, onClose }) {
  const dispatch  = useDispatch();
  const toast     = useToast();
  const recipe    = useSelector((s) => s.recipes.selectedRecipe);
  const favorites = useSelector((s) => s.favorites.items);
  const isSaved   = favorites.some((r) => r.id === recipeId);

  useEffect(() => {
    if (recipeId) dispatch(fetchRecipeById(recipeId));
    return () => dispatch(setSelectedRecipe(null));
  }, [recipeId, dispatch]);

  function handleSave() {
    if (!recipe) return;
    if (isSaved) {
      dispatch(removeFavorite(recipe.id));
      toast('Removed from favorites', 'info');
    } else {
      dispatch(addFavorite({ id: recipe.id, title: recipe.title, image: recipe.image, readyInMinutes: recipe.readyInMinutes, servings: recipe.servings }));
      toast('Saved to favorites!', 'success');
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!recipe ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="relative">
              <img src={recipe.image} alt={recipe.title} className="w-full h-56 object-cover rounded-t-2xl" />
              <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 text-gray-600">✕</button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
                <button
                  onClick={handleSave}
                  className={`shrink-0 px-4 py-2 rounded-lg font-medium text-sm ${isSaved ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                >
                  {isSaved ? 'Unsave' : 'Save'}
                </button>
              </div>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>{recipe.readyInMinutes} min</span>
                <span>{recipe.servings} servings</span>
                {recipe.cuisines?.[0] && <span>{recipe.cuisines[0]}</span>}
              </div>
              {recipe.summary && (
                <p
                  className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-4"
                  dangerouslySetInnerHTML={{ __html: recipe.summary }}
                />
              )}
              {recipe.extendedIngredients?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">Ingredients</h3>
                  <ul className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                    {recipe.extendedIngredients.map((ing) => (
                      <li key={ing.id} className="flex items-start gap-1">
                        <span className="text-brand-500 mt-0.5">•</span>
                        {ing.original}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recipe.analyzedInstructions?.[0]?.steps?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    {recipe.analyzedInstructions[0].steps.map((step) => (
                      <li key={step.number} className="flex gap-2">
                        <span className="shrink-0 font-bold text-brand-600">{step.number}.</span>
                        {step.step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
