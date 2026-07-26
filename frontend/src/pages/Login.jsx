import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">
            Log in to continue to ToLetFinder.
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-emerald-400 font-medium hover:text-emerald-300"
            >
              Sign up
            </a>
          </p>
          {/* <p className="text-sm text-center mt-2">
            <a href="/forgot-password" className="text-gray-500 hover:text-gray-400 hover:underline">Forgot password?</a>
          </p> */}
        </div>
      </div>
    </div>
  );
}
