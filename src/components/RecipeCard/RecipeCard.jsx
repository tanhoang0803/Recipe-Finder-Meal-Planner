import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../../store/favoritesSlice';
import { addToMealPlan } from '../../store/mealPlanSlice';
import { useToast } from '../Common/Toast';
import RecipeModal from '../Common/RecipeModal';
import { DAYS } from '../../utils/weekUtils';

export default function RecipeCard({ recipe }) {
  const dispatch  = useDispatch();
  const toast     = useToast();
  const favorites = useSelector((s) => s.favorites.items);
  const isSaved   = favorites.some((r) => r.id === recipe.id);
  const [modalOpen, setModalOpen]     = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  function handleSave(e) {
    e.stopPropagation();
    if (isSaved) {
      dispatch(removeFavorite(recipe.id));
      toast('Removed from favorites', 'info');
    } else {
      dispatch(addFavorite({ id: recipe.id, title: recipe.title, image: recipe.image, readyInMinutes: recipe.readyInMinutes, servings: recipe.servings }));
      toast('Saved to favorites!', 'success');
    }
  }

  function handleAddToDay(day) {
    dispatch(addToMealPlan({ day, recipe: { id: recipe.id, title: recipe.title, image: recipe.image } }));
    toast(`Added to ${day}!`, 'success');
    setAddMenuOpen(false);
  }

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative">
          <img
            src={recipe.image || 'https://placehold.co/312x200?text=No+Image'}
            alt={recipe.title}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
          {recipe.source === 'ai' && (
            <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              AI
            </span>
          )}
          <button
            onClick={handleSave}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-lg shadow ${isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{recipe.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3 text-xs text-gray-500">
              {recipe.readyInMinutes && <span>{recipe.readyInMinutes} min</span>}
              {recipe.servings       && <span>{recipe.servings} serv</span>}
            </div>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setAddMenuOpen((o) => !o); }}
                className="text-xs bg-brand-100 text-brand-700 hover:bg-brand-200 px-2 py-1 rounded-lg font-medium"
              >
                + Plan
              </button>
              {addMenuOpen && (
                <div className="absolute right-0 bottom-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-32">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={(e) => { e.stopPropagation(); handleAddToDay(day); }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 capitalize"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <RecipeModal recipeId={recipe.id} onClose={() => setModalOpen(false)} />}
    </>
  );
}
