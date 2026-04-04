import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../../services/authService';
import { clearUser } from '../../store/userSlice';
import { clearFavorites } from '../../store/favoritesSlice';
import { clearMealPlan } from '../../store/mealPlanSlice';
import { useToast } from '../Common/Toast';

const navLinks = [
  { to: '/',          label: 'Search'   },
  { to: '/favorites', label: 'Favorites' },
  { to: '/planner',   label: 'Planner'  },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const toast           = useToast();
  const { isAuthenticated, displayName } = useSelector((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    dispatch(clearUser());
    dispatch(clearFavorites());
    dispatch(clearMealPlan());
    toast('Signed out', 'info');
    navigate('/login');
  }

  return (
    <nav className="bg-brand-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          🍽 RecipePlanner
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive ? 'text-white underline underline-offset-4' : 'text-brand-100 hover:text-white'
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Auth controls */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-brand-100">{displayName}</span>
              <button
                onClick={handleSignOut}
                className="bg-brand-700 hover:bg-brand-600 px-3 py-1.5 rounded-lg"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="hover:text-brand-200">Login</Link>
              <Link to="/register" className="bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-lg">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen((o) => !o)}>
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm bg-brand-800">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-white">
              {label}
            </NavLink>
          ))}
          {isAuthenticated
            ? <button onClick={handleSignOut} className="text-left text-brand-100 hover:text-white">Sign out</button>
            : <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-white">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-brand-100 hover:text-white">Register</Link>
              </>
          }
        </div>
      )}
    </nav>
  );
}
