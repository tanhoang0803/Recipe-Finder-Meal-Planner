export function aggregateIngredients(week) {
  const seen = new Map();

  Object.values(week).forEach((recipes) => {
    recipes.forEach((recipe) => {
      const ingredients = recipe.extendedIngredients ?? recipe.usedIngredients ?? [];
      ingredients.forEach((ing) => {
        const name = (ing.name ?? ing).toLowerCase();
        if (!seen.has(name)) {
          seen.set(name, {
            ingredient: ing.name ?? ing,
            amount: ing.amount ? `${ing.amount} ${ing.unit ?? ''}`.trim() : '',
            category: 'other',
          });
        }
      });
    });
  });

  return Array.from(seen.values());
}
