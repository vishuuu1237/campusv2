import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
            setMessage(res.data?.message || 'If the email exists, a reset link has been sent.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Enter your email to receive a password reset link.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Email address" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send reset link'}
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
