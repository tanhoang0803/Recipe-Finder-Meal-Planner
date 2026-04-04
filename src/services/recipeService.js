const BASE = 'https://api.spoonacular.com';
const KEY  = import.meta.env.VITE_SPOONACULAR_API_KEY;

async function request(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apiKey', KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());

  if (res.status === 402) {
    throw new Error('Daily recipe limit reached. Try again tomorrow.');
  }
  if (!res.ok) {
    throw new Error(`Spoonacular error: ${res.status}`);
  }
  return res.json();
}

export async function searchRecipes(query, options = {}) {
  const data = await request('/recipes/complexSearch', {
    query,
    number: 12,
    addRecipeInformation: true,
    ...options,
  });
  return data.results ?? [];
}

export async function searchByIngredients(ingredients) {
  const data = await request('/recipes/findByIngredients', {
    ingredients: ingredients.join(','),
    number: 12,
    ranking: 1,
    ignorePantry: true,
  });
  return data ?? [];
}

export async function getRecipeById(id) {
  return request(`/recipes/${id}/information`, { includeNutrition: false });
}

export async function searchRecipeImage(title) {
  try {
    // Use first 3 words for a broader Spoonacular match
    const shortQuery = title.split(' ').slice(0, 3).join(' ');
    const data = await request('/recipes/complexSearch', { query: shortQuery, number: 1 });
    return data.results?.[0]?.image ?? '';
  } catch {
    return '';
  }
}
