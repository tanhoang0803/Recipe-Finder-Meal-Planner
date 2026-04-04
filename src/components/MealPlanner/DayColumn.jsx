import { useDispatch } from 'react-redux';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { removeFromMealPlan } from '../../store/mealPlanSlice';

export default function DayColumn({ day, recipes }) {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col min-w-0">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">
        {day}
      </h3>
      <Droppable droppableId={day}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[160px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-50 border-2 border-brand-300' : 'bg-gray-50 border-2 border-transparent'
            }`}
          >
            {recipes.map((recipe, index) => (
              <Draggable key={String(recipe.id)} draggableId={String(recipe.id)} index={index}>
                {(drag, dragSnapshot) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    {...drag.dragHandleProps}
                    className={`group relative bg-white rounded-lg shadow-sm border border-gray-100 mb-2 overflow-hidden ${
                      dragSnapshot.isDragging ? 'shadow-lg rotate-1' : ''
                    }`}
                  >
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-16 object-cover"
                      />
                    )}
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                        {recipe.title}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromMealPlan({ day, recipeId: recipe.id }))}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {recipes.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-6">Drop here</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
