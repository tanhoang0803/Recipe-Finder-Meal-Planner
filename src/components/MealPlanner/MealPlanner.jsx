import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from '@hello-pangea/dnd';
import { moveRecipe, setWeek, clearMealPlan } from '../../store/mealPlanSlice';
import { generateWeeklyPlan } from '../../services/aiService';
import { searchRecipeImage } from '../../services/recipeService';
import { useToast } from '../Common/Toast';
import DayColumn from './DayColumn';
import LoadingSpinner from '../Common/LoadingSpinner';
import { DAYS } from '../../utils/weekUtils';

export default function MealPlanner() {
  const dispatch = useDispatch();
  const toast    = useToast();
  const { week, status } = useSelector((s) => s.mealPlan);
  const [generating, setGenerating] = useState(false);

  function onDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const recipeId = Number(draggableId);
    if (source.droppableId !== destination.droppableId) {
      dispatch(moveRecipe({ from: source.droppableId, to: destination.droppableId, recipeId }));
    }
  }

  async function handleAIGenerate() {
    setGenerating(true);
    try {
      const plan = await generateWeeklyPlan();
      // plan is { monday: title, ... } — convert to { monday: [{ id, title }], ... }
      const newWeek = Object.fromEntries(
        await Promise.all(
          DAYS.map(async (day) => {
            if (!plan[day]) return [day, []];
            const image = await searchRecipeImage(plan[day]);
            return [day, [{ id: `ai-${day}`, title: plan[day], image }]];
          })
        )
      );
      dispatch(setWeek(newWeek));
      toast('AI weekly plan generated!', 'success');
    } catch (err) {
      toast(err.message || 'AI plan failed', 'error');
    } finally {
      setGenerating(false);
    }
  }

  if (status === 'loading') return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Meal Planner</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            {generating ? 'Generating…' : '✨ AI Generate'}
          </button>
          <button
            onClick={() => { dispatch(clearMealPlan()); toast('Meal plan cleared', 'info'); }}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Drag recipes between days. Add recipes from the Search page using the &quot;+ Plan&quot; button.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => (
            <DayColumn key={day} day={day} recipes={week[day] ?? []} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
