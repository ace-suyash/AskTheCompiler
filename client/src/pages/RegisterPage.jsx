
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {

    if (!form.username || form.username.length < 3)
      return 'Username must be at least 3 characters.';

    if (!/^[a-zA-Z0-9_-]+$/.test(form.username))
      return 'Username can only contain letters, numbers, underscores, and hyphens.';

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      return 'Please enter a valid email address.';

    if (!form.password || form.password.length < 8)
      return 'Password must be at least 8 characters.';

    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {

    if (!pwd) return null;

    if (pwd.length < 8) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' };

    if (pwd.length < 10) return { label: 'Weak', color: 'bg-orange-500', width: 'w-2/4' };

    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-3/4' };

    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-brand-500 font-mono font-bold text-2xl">&gt;_</span>
            <span className="font-bold text-white text-xl tracking-tight">AskTheCompiler</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your developer account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder="devhandle"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-200 placeholder-gray-500 focus:outline-none
                           focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-200 placeholder-gray-500 focus:outline-none
                           focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-200 placeholder-gray-500 focus:outline-none
                           focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                           text-sm text-gray-200 placeholder-gray-500 focus:outline-none
                           focus:ring-2 focus:ring-brand-600 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 text-sm
                              rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
