import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ── Favorites ──────────────────────────────────────────────

export async function saveFavoritesToFirestore(uid, favorites) {
  const colRef = collection(db, 'users', uid, 'favorites');
  // overwrite: delete all then re-add
  const snapshot = await getDocs(colRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  await Promise.all(
    favorites.map((recipe) =>
      setDoc(doc(db, 'users', uid, 'favorites', String(recipe.id)), recipe)
    )
  );
}

export async function getFavoritesFromFirestore(uid) {
  const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snapshot.docs.map((d) => d.data());
}

// ── Meal Plans ──────────────────────────────────────────────

export async function saveMealPlanToFirestore(uid, weekId, week) {
  await setDoc(doc(db, 'users', uid, 'mealPlans', weekId), { weekId, ...week });
}

export async function getMealPlanFromFirestore(uid, weekId) {
  const snap = await getDoc(doc(db, 'users', uid, 'mealPlans', weekId));
  return snap.exists() ? snap.data() : null;
}
