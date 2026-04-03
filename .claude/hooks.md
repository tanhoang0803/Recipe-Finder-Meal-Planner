# Hooks — Recipe Finder & Meal Planner

Hooks are event-driven triggers that connect user actions to app behavior. These are the "if this, then that" rules of the application.

---

## Search Hooks

### on-search-input
**Event**: User types in SearchBar
**Action**: Start 300ms debounce timer
**After debounce**: Dispatch `fetchRecipes(query)` to RecipeAgent

### on-ingredient-submit
**Event**: User submits ingredient form
**Action**: Parse comma-separated ingredients → dispatch `fetchByIngredients(ingredients[])`

### on-filter-change
**Event**: User changes a filter (cuisine, diet, time)
**Action**: Apply client-side filter to `recipesSlice.results` without API call

---

## Recipe Interaction Hooks

### on-recipe-click
**Event**: User clicks a RecipeCard
**Action**: Dispatch `setSelectedRecipe(id)` → fetch full details if not already in cache

### on-save-click
**Event**: User clicks Save button on RecipeCard
**Action**:
  1. Check if user is authenticated → if not, show "Log in to save recipes" prompt
  2. If authenticated: dispatch `addFavorite(recipe)`
  3. Sync favorites to Firestore in background

### on-recipe-drag
**Event**: User starts dragging a recipe card
**Action**: Set drag state in MealPlanner context → highlight valid drop zones

### on-recipe-drop
**Event**: User drops recipe onto a day column
**Action**: Dispatch `addToMealPlan({ day, recipe })` → sync to Firestore

---

## Meal Plan Hooks

### on-meal-plan-change
**Event**: Any mutation to `mealPlanSlice` (add, remove, move)
**Action**: Debounce 1s → sync updated plan to Firestore (prevents write on every drag)

### on-week-navigate
**Event**: User clicks "Previous Week" / "Next Week"
**Action**: Load meal plan for target week from Firestore (or initialize empty plan)

### on-shopping-list-request
**Event**: User clicks "Generate Shopping List"
**Action**: Aggregate all ingredients from current week's recipes → deduplicate → render ShoppingList

---

## AI Hooks

### on-ai-suggest
**Event**: User clicks "Suggest Recipes" after entering ingredients
**Action**: Dispatch `fetchAISuggestions(ingredients)` → AIPlannerAgent handles OpenAI call

### on-ai-plan-generate
**Event**: User clicks "Generate Week Plan with AI"
**Action**: Show preferences form → on submit, dispatch `generateAIWeeklyPlan(preferences)`

---

## Auth Hooks

### on-app-mount
**Event**: App component mounts
**Action**: Subscribe to `onAuthStateChanged` → update `userSlice` on every auth state change

### on-sign-in
**Event**: `userSlice.isAuthenticated` becomes `true`
**Action**:
  1. Load favorites from Firestore → dispatch to `favoritesSlice`
  2. Load current week meal plan from Firestore → dispatch to `mealPlanSlice`

### on-sign-out
**Event**: User clicks "Sign Out"
**Action**:
  1. `authService.signOut()`
  2. Clear `favoritesSlice.items`
  3. Clear `mealPlanSlice.week`
  4. Clear `userSlice`
  5. Redirect to home/login page

---

## Error Hooks

### on-api-error
**Event**: Any service call returns an error
**Action**: Dispatch error to relevant slice → component reads `slice.error` → show user-facing message

### on-quota-exceeded
**Event**: Spoonacular returns 402
**Action**: Set `recipesSlice.error = "Daily recipe limit reached. Try again tomorrow."` → disable search input

### on-auth-error
**Event**: Firebase returns auth error
**Action**: Map Firebase error code to human-readable message:
  - `auth/wrong-password` → "Incorrect password."
  - `auth/user-not-found` → "No account found with that email."
  - `auth/too-many-requests` → "Too many attempts. Please wait a few minutes."
