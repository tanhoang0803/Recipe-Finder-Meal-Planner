import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './components/FavoritesPage/FavoritesPage';
import MealPlanner from './components/MealPlanner/MealPlanner';
import Dashboard from './components/Dashboard/Dashboard';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';

export default function App() {
  useAuth();

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <Layout>
          <SearchPage />
        </Layout>
      } />
      <Route path="/favorites" element={
        <Layout>
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        </Layout>
      } />
      <Route path="/planner" element={
        <Layout>
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        </Layout>
      } />
      <Route path="/dashboard" element={
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      } />
    </Routes>
  );
}
