import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from '../services/authService';
import { setUser, clearUser } from '../store/userSlice';
import { loadFavorites, clearFavorites } from '../store/favoritesSlice';
import { loadMealPlan, clearMealPlan } from '../store/mealPlanSlice';
import { getWeekId } from '../utils/weekUtils';

export function useAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
        }));
        dispatch(loadFavorites(firebaseUser.uid));
        dispatch(loadMealPlan({ uid: firebaseUser.uid, weekId: getWeekId() }));
      } else {
        dispatch(clearUser());
        dispatch(clearFavorites());
        dispatch(clearMealPlan());
      }
    });
    return unsubscribe;
  }, [dispatch]);
}
