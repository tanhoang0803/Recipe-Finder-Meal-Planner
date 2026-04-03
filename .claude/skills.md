# Skills — Recipe Finder & Meal Planner

Skills are discrete capabilities the app and its agents can perform. Each skill maps to one or more service calls and Redux actions.

---

## Recipe Skills

### search-by-name
**Trigger**: User types in SearchBar
**Flow**: Debounce 300ms → `fetchRecipes(query)` → `recipeService.searchRecipes` → update `recipesSlice.results`
**Caching**: Skip API call if same query was made within last 10 minutes

### search-by-ingredients
**Trigger**: User enters comma-separated ingredients in ingredient search field
**Flow**: Parse input → `recipeService.searchByIngredients(ingredients[])` → update `recipesSlice.results`

### view-recipe-detail
**Trigger**: User clicks a RecipeCard
**Flow**: `recipeService.getRecipeById(id)` → update `recipesSlice.selectedRecipe` → open RecipeDetail modal

### filter-results
**Trigger**: User applies filters (cuisine, diet, maxTime)
**Flow**: Client-side filter on `recipesSlice.results` — no additional API call

---

## Favorites Skills

### save-recipe
**Trigger**: User clicks "Save" button on RecipeCard
**Flow**: `addFavorite(recipe)` → update `favoritesSlice.items` → sync to Firestore (if authenticated)

### remove-recipe
**Trigger**: User clicks remove/unsave button
**Flow**: `removeFavorite(recipeId)` → update `favoritesSlice.items` → sync to Firestore

### view-favorites
**Trigger**: User navigates to /favorites
**Flow**: Read `favoritesSlice.items` — no additional fetch needed (already in Redux)

---

## Meal Planning Skills

### add-to-meal-plan
**Trigger**: User drags a recipe onto a day column OR clicks "Add to [Day]"
**Flow**: `addToMealPlan({ day, recipe })` → update `mealPlanSlice.week[day]` → sync to Firestore

### remove-from-meal-plan
**Trigger**: User clicks remove button on a planned meal
**Flow**: `removeFromMealPlan({ day, recipeId })` → update `mealPlanSlice.week[day]` → sync to Firestore

### move-between-days
**Trigger**: User drags a recipe from one day to another
**Flow**: `moveRecipe({ from, to, recipeId })` → update both day arrays in `mealPlanSlice` → sync to Firestore

### generate-shopping-list
**Trigger**: User clicks "Generate Shopping List" on Dashboard
**Flow**: Read all recipes in `mealPlanSlice.week` → aggregate ingredients → deduplicate → display in ShoppingList component
**AI enhancement (optional)**: Pass ingredient list to `aiService.generateShoppingList` for organized, categorized output

---

## AI Skills

### suggest-from-ingredients
**Trigger**: User submits ingredient form in AI panel
**Flow**: `aiService.suggestRecipes(ingredients)` → parse JSON response → map to Recipe shape → update `recipesSlice.results` with `source: 'ai'`

### generate-weekly-plan
**Trigger**: User clicks "Generate Week Plan with AI"
**Flow**: Collect user preferences → `aiService.generateWeeklyPlan(preferences)` → parse response → populate `mealPlanSlice.week`

---

## Auth Skills

### sign-in
**Trigger**: User submits login form
**Flow**: `authService.signInWithEmail(email, password)` → update `userSlice` → load user data from Firestore

### sign-out
**Trigger**: User clicks "Sign Out"
**Flow**: `authService.signOut()` → clear `userSlice`, `favoritesSlice`, `mealPlanSlice`

### persist-on-change
**Trigger**: Any change to `favoritesSlice` or `mealPlanSlice` while user is authenticated
**Flow**: Firestore write (async, non-blocking) → show sync indicator
