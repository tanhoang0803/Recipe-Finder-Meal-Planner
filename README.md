# Recipe Finder & Meal Planner

## Overview

A full-stack web application that helps users discover recipes, organize favorites, and plan weekly meals with AI-powered suggestions. Built with a senior engineer's mindset: clean architecture, predictable state, and scalable integration patterns.

## Features

- **Recipe Search** — query by name or ingredients via Spoonacular API
- **Favorites** — save, view, and remove recipes with persistent storage (Firebase)
- **Weekly Meal Planner** — drag-and-drop calendar interface with full CRUD
- **AI Suggestions** — enter ingredients you have; AI returns optimized recipe combinations
- **Shopping List** — auto-generated from your weekly meal plan
- **Authentication** — Firebase email/password login (Google OAuth optional)

## Why This Project Matters

This app deliberately combines patterns that repeat across almost every real-world frontend:

| Pattern | Where It Appears |
|---|---|
| Search + Filter | Job boards, e-commerce, learning apps |
| CRUD with calendar | Scheduling, task managers, booking systems |
| AI recommender flow | Movies, books, workout planners |
| Auth + user storage | Any authenticated SaaS product |

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| State Management | Redux Toolkit |
| Authentication | Firebase Auth |
| Database / Storage | Firebase Firestore |
| Recipe Data | Spoonacular API |
| AI Suggestions | Groq API (llama-3.1-8b-instant) — free tier |
| Hosting | Vercel / Netlify |
| Styling | Tailwind CSS |
| Charts (optional) | Chart.js |

## Installation

### Prerequisites
- Node.js >= 18
- npm or yarn
- Firebase project (free tier)
- Spoonacular API key (free tier)
- Groq API key (free tier, for AI features — [console.groq.com](https://console.groq.com))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/tanhoang0803/Recipe-Finder-Meal-Planner.git
cd Recipe-Finder-Meal-Planner

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your API keys in .env (see .env.example for all required variables)

# 4. Start development server
npm run dev
```

The app will run at `http://localhost:5173`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SearchBar/
│   ├── RecipeList/
│   ├── RecipeCard/
│   ├── MealPlanner/
│   ├── Dashboard/
│   └── FavoritesPage/
├── store/               # Redux store + slices
│   ├── recipesSlice.js
│   ├── favoritesSlice.js
│   ├── mealPlanSlice.js
│   └── userSlice.js
├── services/            # API abstraction layer
│   ├── recipeService.js
│   ├── authService.js
│   └── aiService.js
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
└── App.js
```

## Environment Variables

See `.env.example` for the full list of required keys. Never commit your `.env` file.

## API Rate Limits

- **Spoonacular free tier**: 150 points/day — results are cached in Redux to minimize calls. AI recipes also fetch images via Spoonacular using a shortened title query.
- **Groq free tier**: ~14,400 requests/day — more than enough for development and personal use.
- **Firebase free tier (Spark)**: generous limits suitable for development and small production loads.

## Scripts

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build
npm test         # Run tests
npm run lint     # ESLint check
```

## Deployment

Push to GitHub and connect to Vercel or Netlify. Set all `.env` variables in the hosting platform's environment settings — never in the codebase.

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with clear messages
4. Open a pull request with a description of what and why
