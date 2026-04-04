import { useState } from 'react';
import { useSelector } from 'react-redux';
import { aggregateIngredients } from '../../utils/shoppingListUtils';
import { generateShoppingList } from '../../services/aiService';
import { useToast } from '../Common/Toast';
import { DAYS } from '../../utils/weekUtils';

const CATEGORY_LABELS = {
  produce: 'Produce',
  protein: 'Protein',
  dairy:   'Dairy',
  pantry:  'Pantry',
  other:   'Other',
};

export default function Dashboard() {
  const toast = useToast();
  const { week } = useSelector((s) => s.mealPlan);
  const favorites = useSelector((s) => s.favorites.items);

  const localList = aggregateIngredients(week);
  const [aiList, setAiList]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const shoppingList = aiList ?? localList;

  const totalMeals = Object.values(week).reduce((acc, day) => acc + day.length, 0);

  async function handleAIShoppingList() {
    setLoading(true);
    try {
      const list = await generateShoppingList(week);
      setAiList(list);
      toast('AI shopping list ready!', 'success');
    } catch (err) {
      toast(err.message || 'AI request failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const grouped = shoppingList.reduce((acc, item) => {
    const cat = item.category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Meals this week" value={totalMeals} />
        <StatCard label="Saved favorites" value={favorites.length} />
        <StatCard label="Shopping items"  value={shoppingList.length} />
      </div>

      {/* This week's plan summary */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">This Week&apos;s Plan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS.map((day) => (
            <div key={day} className="min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1 capitalize">{day}</p>
              {week[day]?.length ? (
                <ul className="space-y-1">
                  {week[day].map((r) => (
                    <li key={r.id} className="text-xs text-gray-700 bg-brand-50 rounded-lg px-2 py-1 line-clamp-2">
                      {r.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-300 italic">empty</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Shopping list */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Shopping List</h2>
          <button
            onClick={handleAIShoppingList}
            disabled={loading || totalMeals === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-sm font-medium"
          >
            {loading ? 'Generating…' : '✨ AI Generate'}
          </button>
        </div>

        {shoppingList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Add meals to your planner to see a shopping list.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              return (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h3>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                        <span className="text-brand-500 mt-0.5 shrink-0">•</span>
                        <span>
                          {item.ingredient}
                          {item.amount && <span className="text-gray-400 ml-1">({item.amount})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-3xl font-bold text-brand-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
