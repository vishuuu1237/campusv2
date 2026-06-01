import { useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

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
            setMessage(res.data?.message || 'Password reset');
            // redirect to login after short delay
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Choose a New Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Enter your new password for this account.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="New password" />
                    </div>
                    <div>
                        <label htmlFor="confirm" className="sr-only">Confirm password</label>
                        <input id="confirm" name="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Confirm new password" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Set new password'}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
