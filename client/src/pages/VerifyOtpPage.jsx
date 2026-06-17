import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';

export default function VerifyOtpPage() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [digits, setDigits] = useState(Array(6).fill(''));
  const [error, setError]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent]     = useState(false);
  const inputs = useRef([]);

  // Redirect if someone lands here without email in state
  if (!email) return <Navigate to="/register" replace />;

  function handleChange(val, idx) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < 6) return setError('Please enter all 6 digits.');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    setResent(false);
    try {
      await api.post('/auth/resend-otp', { email });
      setResent(true);
      setDigits(Array(6).fill(''));
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-brand-500 font-mono font-bold text-2xl">&gt;_</span>
            <span className="font-bold text-white text-xl tracking-tight">AskTheCompiler</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Check your email for the OTP</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-400 text-center mb-6">
            We sent a 6-digit code to{' '}
            <span className="text-brand-400 font-medium">{email}</span>
          </p>

          {/* OTP boxes */}
          <div className="flex justify-center gap-2 mb-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onPaste={handlePaste}
                className="w-11 h-14 text-center text-xl font-bold rounded-lg
                           bg-gray-800 text-white border border-gray-700
                           focus:outline-none focus:ring-2 focus:ring-brand-600
                           focus:border-transparent caret-transparent"
              />
            ))}
          </div>

          {error  && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm
                            rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-green-950 border border-green-800 text-green-300 text-sm
                            rounded-lg px-4 py-3 mb-4">
              OTP resent! Check your inbox.
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full mt-3 text-sm text-gray-400 hover:text-brand-400
                       transition disabled:opacity-50"
          >
            {resending ? 'Resending...' : "Didn't receive it? Resend OTP"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Wrong email?{' '}
          <Link to="/register" className="text-brand-500 hover:underline">
            Go back
          </Link>
        </p>

      </div>
    </div>
  );
}