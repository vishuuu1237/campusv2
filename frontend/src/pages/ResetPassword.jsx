import { useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RecampusLogo from '../components/RecampusLogo';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { token, password });
      setMessage(res.data?.message || 'Password reset successfully');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-space-md px-4">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-8 space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <RecampusLogo className="h-8 mx-auto" />
          </Link>
          <h2 className="font-headline-md text-on-surface">Set New Password</h2>
          <p className="font-body-sm text-on-surface-variant mt-1">
            Choose a strong new password for your Recampus account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {message && (
            <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-sm">
              {message} (Redirecting to Sign In...)
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-label-md text-on-surface-variant">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Min 6 characters"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirm" className="font-label-md text-on-surface-variant">
              Confirm New Password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Saving...' : 'Set New Password'}</span>
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="font-label-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
