import { useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchRecipes, clearResults } from '../store/recipesSlice';

export function useRecipeSearch(delay = 300) {
  const dispatch = useDispatch();
  const timer    = useRef(null);

  const search = useCallback((query, options = {}) => {
    clearTimeout(timer.current);
    if (!query.trim()) {
      dispatch(clearResults());
      return;
    }
    timer.current = setTimeout(() => {
      dispatch(fetchRecipes({ query, options }));
    }, delay);
  }, [dispatch, delay]);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    dispatch(clearResults());
  }, [dispatch]);

  return { search, clear };
}
