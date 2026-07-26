import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Search from "./pages/Search";
import PropertyDetails from "./pages/PropertyDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import AddListing from "./pages/AddListing";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="flex justify-between items-center px-4 sm:px-6 py-4">
        <Link to="/" className="font-extrabold text-xl text-white tracking-tight">
          ToLet<span className="text-emerald-500">Finder</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition">Home</Link>
          <Link to="/search" className="text-sm font-medium text-gray-300 hover:text-white transition">Search</Link>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition px-3 py-2">Login</Link>
                <Link to="/register" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full transition">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center hover:ring-2 hover:ring-emerald-500/40 transition"
                >
                  {initials}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                    <p className="px-4 py-3 text-sm font-semibold text-white truncate border-b border-gray-700">{user.name}</p>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">My Profile</Link>
                    <Link to="/owner/add-listing" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">List a Property</Link>
                    <Link to="/owner/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">My Listings</Link>
                    {user.role === "admin" && (
                      <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">Admin Dashboard</Link>
                    )}
                    <hr className="border-gray-700 my-1" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 transition">Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="sm:hidden w-10 h-10 flex items-center justify-center text-gray-300"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-800 px-4 py-4 space-y-1 bg-gray-900">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">Home</Link>
          <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">Search</Link>

          {!user ? (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block mt-2 text-center text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-full">Sign Up</Link>
            </>
          ) : (
            <>
              <hr className="border-gray-800 my-2" />
              <p className="px-2 py-1 text-sm font-semibold text-white">{user.name}</p>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">My Profile</Link>
              <Link to="/owner/add-listing" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">List a Property</Link>
              <Link to="/owner/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">My Listings</Link>
              {user.role === "admin" && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-2.5 text-sm text-gray-300 hover:text-white">Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-2 py-2.5 text-sm text-red-400">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
