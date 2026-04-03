# Memory — Recipe Finder & Meal Planner

---

## Project Context

**Stack**: React 18, Redux Toolkit, Firebase (Auth + Firestore), Spoonacular API, OpenAI API (GPT-4o-mini), Tailwind CSS.

**Purpose**: Learning project practicing search/CRUD/auth/AI integration — transferable to real-world frontend roles.

**Key files in this repo:**
| File | Purpose |
|---|---|
| `README.md` | Project summary, install steps, tech stack |
| `CLAUDE.md` | Architecture, Redux contracts, service contracts, conventions |
| `.env.example` | All required API key placeholders |
| `.doc` | Developer notes: API quirks, errors, testing strategy |
| `forTanQHoang.md` | 9-step reflection: approach, tradeoffs, mistakes, lessons |
| `.claude/agents/` | 4 agents: RecipeAgent, AuthAgent, AIPlannerAgent, NotificationAgent |
| `.claude/skills.md` | App capabilities mapped to service calls + Redux actions |
| `.claude/hooks.md` | Event-to-action trigger rules |
| `.claude/memory.md` | This file |

---

## Deploy Pipeline

- **`ci.yml`** — triggers on every push/PR to `main`/`develop`: lint → test → upload coverage
- **`deploy.yml`** — triggers on push to `main` only: test → build → Vercel production deploy
- Uses `amondnet/vercel-action@v25`
- Required GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, all `REACT_APP_*` keys
- Get `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` from `.vercel/project.json` after running `vercel link` locally

---

## Git Identity — Sole Contributor Rule

**TanQHoang is the only author on every commit. Claude must never appear as a contributor.**

- Name: `TanQHoang`
- Email: `hoangquoctan.1996@gmail.com`
- Never add `Co-authored-by: Claude` or any Anthropic trailer to commit messages
- Never suggest git config changes that override this identity
- Verify local config: `git config user.name` / `git config user.email`
- Set if missing: `git config --global user.name "TanQHoang"` and `git config --global user.email "hoangquoctan.1996@gmail.com"`

---

## App Data (Firebase Firestore)

What the app remembers about the user across sessions.

---

## User Preferences
Stored at: `users/{uid}/preferences`

```json
{
  "dietaryRestrictions": ["vegetarian", "gluten-free"],
  "cuisinePreferences": ["Italian", "Asian"],
  "allergies": ["nuts", "shellfish"],
  "servingSize": 2,
  "cookingTimeMax": 45,
  "skillLevel": "intermediate"
}
```

Used by: AIPlannerAgent (included in weekly plan prompt), filter defaults in SearchBar.

---

## Saved Recipes (Favorites)
Stored at: `users/{uid}/favorites/{recipeId}`

```json
{
  "id": 12345,
  "title": "Garlic Butter Chicken",
  "image": "https://...",
  "readyInMinutes": 30,
  "servings": 4,
  "savedAt": "2025-04-01T12:00:00Z",
  "source": "spoonacular"
}
```

Loaded into `favoritesSlice` on login. Synced back on every change.

---

## Weekly Meal Plans
Stored at: `users/{uid}/mealPlans/{weekId}`
`weekId` format: `YYYY-WW` (e.g., `2025-14`)

```json
{
  "weekId": "2025-14",
  "monday": [{ "id": 12345, "title": "Garlic Butter Chicken", "image": "..." }],
  "tuesday": [],
  "wednesday": [{ "id": 67890, "title": "Pasta Primavera", "image": "..." }],
  "thursday": [],
  "friday": [],
  "saturday": [],
  "sunday": []
}
```

Only the current week is loaded into Redux on login. Past weeks remain in Firestore for history.

---

## Shopping Lists
Stored at: `users/{uid}/shoppingLists/{weekId}`

```json
{
  "weekId": "2025-14",
  "items": [
    { "ingredient": "chicken breast", "amount": "500g", "category": "protein" },
    { "ingredient": "garlic", "amount": "4 cloves", "category": "produce" }
  ],
  "generatedAt": "2025-04-01T12:00:00Z",
  "checkedItems": ["garlic"]
}
```

`checkedItems` persists which ingredients the user has already bought.

---

## Auth State
Managed by Firebase Auth — not stored in Firestore separately.
Redux `userSlice` mirrors the Firebase auth state in memory during the session.

```js
{
  uid: "abc123",
  email: "tan@example.com",
  displayName: "Tan Hoang",
  isAuthenticated: true
}
```

---

## Memory Lifecycle

| Event | Memory Action |
|---|---|
| User logs in | Load preferences, favorites, current week plan from Firestore |
| User saves recipe | Write to `favorites/{recipeId}` in Firestore |
| User updates meal plan | Debounced write to `mealPlans/{weekId}` in Firestore |
| User checks shopping item | Update `shoppingLists/{weekId}.checkedItems` |
| User signs out | Clear all Redux slices (Firestore data persists for next login) |
| User changes preferences | Update `preferences` document in Firestore |
