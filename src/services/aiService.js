const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const KEY = import.meta.env.VITE_OPENAI_API_KEY;

async function chat(systemPrompt, userMessage) {
  if (!KEY) throw new Error('AI features require an OpenAI API key.');

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(raw) {
  // Strip markdown code fences if present
  const clean = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
}

export async function suggestRecipes(ingredients) {
  const system =
    'You are a helpful chef assistant. Respond ONLY with valid JSON — no explanation, no markdown.';
  const user =
    `The user has: ${ingredients.join(', ')}. ` +
    'Suggest 6 recipes using most of these ingredients. ' +
    'Return a JSON array: [{"id": unique_number, "title": string, "image": "", ' +
    '"readyInMinutes": number, "servings": number, "usedIngredients": string[], ' +
    '"description": string, "source": "ai"}]';

  const raw = await chat(system, user);
  return parseJSON(raw);
}

export async function generateWeeklyPlan(preferences = {}) {
  const system =
    'You are a meal planning assistant. Respond ONLY with valid JSON — no explanation, no markdown.';
  const prefs = JSON.stringify(preferences);
  const user =
    `User preferences: ${prefs}. ` +
    'Generate a balanced 7-day dinner plan (Monday–Sunday). ' +
    'Return JSON: {"monday": recipe_title, "tuesday": recipe_title, ..., "sunday": recipe_title}';

  const raw = await chat(system, user);
  return parseJSON(raw);
}

export async function generateShoppingList(weeklyPlan) {
  const meals = Object.values(weeklyPlan)
    .flat()
    .map((r) => r.title)
    .join(', ');

  const system =
    'You are a helpful shopping assistant. Respond ONLY with valid JSON — no explanation, no markdown.';
  const user =
    `Planned meals: ${meals}. ` +
    'Generate a consolidated shopping list. ' +
    'Return JSON: [{"ingredient": string, "amount": string, "category": "produce"|"protein"|"dairy"|"pantry"|"other"}]';

  const raw = await chat(system, user);
  return parseJSON(raw);
}
