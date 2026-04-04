# CLAUDE.md — Architecture, Instructions & Conventions

This file tells Claude Code (and any developer) how this project is structured, how to navigate it, and what rules to follow.

---

## Architecture Overview

```
React Components
      │
      ▼
Redux Store (Toolkit slices)
      │
      ▼
Service Layer (recipeService, authService, aiService)
      │
      ▼
External APIs (Spoonacular, Firebase, Groq)
```

Each layer has one responsibility. **Never call external APIs directly from components** — always go through the service layer.

---

## Directory Structure

```
src/
├── components/
│   ├── SearchBar/
│   │   ├── SearchBar.jsx          # Controlled input, dispatches fetchRecipes
│   │   └── SearchBar.test.jsx
│   ├── RecipeList/
│   │   ├── RecipeList.jsx         # Maps over recipesSlice results
│   │   └── RecipeList.test.jsx
│   ├── RecipeCard/
│   │   ├── RecipeCard.jsx         # Single recipe: image, title, save button
│   │   └── RecipeCard.test.jsx
│   ├── MealPlanner/
│   │   ├── MealPlanner.jsx        # Weekly calendar grid with drag-and-drop
│   │   ├── DayColumn.jsx          # Single day column component
│   │   └── MealPlanner.test.jsx
│   ├── Dashboard/
│   │   ├── Dashboard.jsx          # Overview: this week's plan + shopping list
│   │   └── Dashboard.test.jsx
│   └── FavoritesPage/
│       ├── FavoritesPage.jsx      # Renders favoritesSlice recipes
│       └── FavoritesPage.test.jsx
│
├── store/
│   ├── index.js                   # configureStore, exports RootState + AppDispatch
│   ├── recipesSlice.js            # search results, loading/error state, caching
│   ├── favoritesSlice.js          # saved recipes (synced to Firestore)
│   ├── mealPlanSlice.js           # { monday: [], tuesday: [], ... } structure
│   └── userSlice.js               # auth state (uid, email, displayName)
│
├── services/
│   ├── recipeService.js           # Spoonacular: searchRecipes, getRecipeById
│   ├── authService.js             # Firebase: signIn, signOut, onAuthChange
│   └── aiService.js               # Groq (llama-3.1-8b-instant): suggestRecipes, generateWeeklyPlan
│
├── hooks/
│   ├── useRecipeSearch.js         # Debounced search hook
│   └── useAuth.js                 # Subscribes to Firebase auth state
│
├── utils/
│   ├── cacheUtils.js              # TTL-based Redux cache helpers
│   └── shoppingListUtils.js       # Derives shopping list from mealPlanSlice
│
├── App.jsx
└── index.js
```

---

## Redux Slice Contracts

### `recipesSlice`
```js
{
  results: Recipe[],          // current search results
  selectedRecipe: Recipe | null,
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null,
  cache: { [query]: { data: Recipe[], timestamp: number } }
}
```

### `favoritesSlice`
```js
{
  items: Recipe[],            // persisted to Firestore on change
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}
```

### `mealPlanSlice`
```js
{
  week: {
    monday: Recipe[],
    tuesday: Recipe[],
    wednesday: Recipe[],
    thursday: Recipe[],
    friday: Recipe[],
    saturday: Recipe[],
    sunday: Recipe[]
  },
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}
```

### `userSlice`
```js
{
  uid: string | null,
  email: string | null,
  displayName: string | null,
  isAuthenticated: boolean,
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}
```

---

## Service Layer Contracts

### `recipeService.js`
```js
searchRecipes(query: string, options?: SearchOptions): Promise<Recipe[]>
getRecipeById(id: number): Promise<RecipeDetail>
searchByIngredients(ingredients: string[]): Promise<Recipe[]>
searchRecipeImage(title: string): Promise<string>   // fetches image URL using first 3 words of title
```

### `authService.js`
```js
signInWithEmail(email: string, password: string): Promise<User>
signOut(): Promise<void>
onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe
saveFavoritesToFirestore(uid: string, favorites: Recipe[]): Promise<void>
getFavoritesFromFirestore(uid: string): Promise<Recipe[]>
```

### `aiService.js`
```js
suggestRecipes(ingredients: string[]): Promise<AISuggestion[]>
generateWeeklyPlan(preferences: UserPreferences): Promise<WeeklyPlan>
generateShoppingList(weeklyPlan: WeeklyPlan): Promise<ShoppingItem[]>
```

---

## Coding Conventions

- **Components** are functional with hooks only. No class components.
- **Redux state** is the single source of truth. No duplicating state in local `useState` when it belongs in the store.
- **API calls** live exclusively in service files and are dispatched via async thunks (`createAsyncThunk`).
- **Error handling**: services throw typed errors; slices catch them and populate `error` field; components read `status` and `error` from the slice.
- **Caching**: before calling Spoonacular, check the `cache` in `recipesSlice`. If the entry exists and is less than 10 minutes old, return cached data.
- **Environment variables**: all keys come from `import.meta.env.VITE_*` (Vite). Never hardcode.
- **Testing**: each component has a `.test.jsx` file. Services are tested with mocked HTTP calls. Slices are unit-tested in isolation.

---

## Data Flow: Recipe Search

```
User types in SearchBar
  → dispatches fetchRecipes(query)
  → recipesSlice checks cache
    → cache hit: return cached results immediately
    → cache miss: call recipeService.searchRecipes(query)
      → Spoonacular API returns Recipe[]
      → store in cache with timestamp
      → update recipesSlice.results
  → RecipeList re-renders with new results
```

## Data Flow: AI Suggestions

```
User enters ingredients in AISuggestForm
  → dispatches fetchAISuggestions(ingredients)
  → aiService.suggestRecipes(ingredients)
    → builds prompt: "Given [chicken, garlic, rice], suggest 6 recipes..."
    → calls Groq API (llama-3.1-8b-instant)
    → parses response into AISuggestion[]
  → for each suggestion: recipeService.searchRecipeImage(title)
    → Spoonacular returns real food image URL
  → recipesSlice.results updated with AI suggestions + images
  → RecipeList renders AI results (tagged with source: 'ai')
```

## Data Flow: Favorites (with persistence)

```
User clicks Save on RecipeCard
  → dispatches addFavorite(recipe)
  → favoritesSlice updates items[]
  → side effect (listener/thunk): if user is authenticated
    → authService.saveFavoritesToFirestore(uid, items)
  → FavoritesPage re-renders
```

---

## Key Tradeoffs

| Decision | Choice | Reason |
|---|---|---|
| State management | Redux Toolkit | Predictable, scalable, great DevTools |
| Auth provider | Firebase | Free tier, fast setup, built-in Google OAuth |
| Recipe API | Spoonacular | Rich data, free tier covers development |
| AI model | Groq llama-3.1-8b-instant | Free tier, very fast, sufficient for recipe suggestions |
| Styling | Tailwind CSS | Utility-first, rapid prototyping, no CSS bloat |
| Offline mode | Not implemented | Requires service worker + IndexedDB; out of scope |

---

## Common Pitfalls to Avoid

1. **API key exposure** — never commit `.env`. Use `.env.example` as template.
2. **Spoonacular rate limits** — always check Redux cache before making requests.
3. **Slice bloat** — keep each slice focused. Don't mix search results with favorites.
4. **Over-fetching** — debounce SearchBar input (300ms) before dispatching.
5. **Auth timing** — wait for `onAuthStateChanged` before reading Firestore. User may be null on first render.
6. **Drag-and-drop complexity** — use `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd). Don't write custom DnD logic.
