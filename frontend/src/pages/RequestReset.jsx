import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RecampusLogo from '../components/RecampusLogo';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/request-password-reset', { email });
      setMessage(res.data?.message || 'If the email exists, a reset link has been generated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset');
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
          <h2 className="font-headline-md text-on-surface">Reset Password</h2>
          <p className="font-body-sm text-on-surface-variant mt-1">
            Enter your student or campus email to receive a password recovery link.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {message && (
            <div className="p-3 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-label-md text-on-surface-variant">
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="student@gmail.com"
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                mail
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
            <span className="material-symbols-outlined text-[18px]">send</span>
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
