import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecampusLogo from './RecampusLogo';

const AuthContainer = ({ defaultMode = 'signin' }) => {
  const [mode, setMode] = useState(defaultMode); // 'signin' | 'register'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'prn'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [prnInput, setPrnInput] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const { login, loginByPrn, register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Required', color: 'bg-outline-variant' };
    if (pwd.length < 6) return { score: 1, text: 'Too Short (min 6)', color: 'bg-error text-error' };
    let score = 1;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score >= 3) return { score: 3, text: 'Strong', color: 'bg-tertiary-container text-tertiary-container' };
    return { score: 2, text: 'Moderate', color: 'bg-secondary text-secondary' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (loginMethod === 'email') {
        result = await login(emailInput, passwordInput);
      } else {
        result = await loginByPrn(nameInput, prnInput);
      }

      if (result && result.success) {
        navigate('/');
      } else {
        setError(result?.error || 'Invalid login credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Recampus Marketplace Terms');
      return;
    }

    try {
      setLoading(true);
      const result = await register(regName, regEmail, regPassword, regStudentId);

      if (result && result.success) {
        navigate('/');
      } else {
        setError(result?.error || 'Registration failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-space-lg px-4">
      {/* Master Split Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* LEFT PANEL: Recampus Value Proposition (5 Cols) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-primary-container via-surface-tint to-primary text-on-primary p-space-xl flex flex-col justify-between overflow-hidden">
          {/* Decorative backdrop shapes */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-space-lg">
              <RecampusLogo className="h-9" textColor="#ffffff" />
            </Link>

            <h1 className="font-headline-lg font-bold text-white leading-tight mb-space-xs">
              Trusted peer trade for your campus.
            </h1>
            <p className="font-body-md text-surface-container-low/90 max-w-sm leading-relaxed mb-space-md">
              Join verified students and local peers exchanging textbooks, tech, and dorm essentials with 100% escrow protection.
            </p>

            {/* Verification Pill */}
            <div className="inline-flex items-center gap-space-sm bg-white/10 backdrop-blur-md px-space-md py-1.5 rounded-full mb-space-md">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-secondary text-white font-label-sm text-[10px] flex items-center justify-center ring-2 ring-white/20 font-bold">
                  VP
                </div>
                <div className="w-6 h-6 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] flex items-center justify-center ring-2 ring-white/20 font-bold">
                  OM
                </div>
                <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[10px] flex items-center justify-center ring-2 ring-white/20 font-bold">
                  KK
                </div>
              </div>
              <span className="font-label-sm text-white font-medium">
                100% Escrow Protected Transfers
              </span>
            </div>
          </div>

          {/* Bento Feature Stack */}
          <div className="relative z-10 flex flex-col gap-2.5 my-space-sm">
            <div className="flex items-center gap-space-sm bg-white/10 backdrop-blur-md p-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-tertiary-fixed shrink-0">
                <span className="material-symbols-outlined text-[18px]">percent</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-label-md text-white font-semibold truncate">
                  Zero Hidden Buyer Fees
                </h4>
                <p className="font-body-sm text-surface-container-low/80 text-xs truncate">
                  Clear transparent pricing on every student exchange.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm bg-white/10 backdrop-blur-md p-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-secondary-fixed shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-label-md text-white font-semibold truncate">
                  Campus Verified Profiles
                </h4>
                <p className="font-body-sm text-surface-container-low/80 text-xs truncate">
                  Student email or ID authentication prevents scammers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-sm bg-white/10 backdrop-blur-md p-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-on-tertiary-container shrink-0">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-label-md text-white font-semibold truncate">
                  Safe Campus Handoff Spots
                </h4>
                <p className="font-body-sm text-surface-container-low/80 text-xs truncate">
                  Designated exchange spots at monitored campus zones.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 pt-space-xs flex items-center justify-between text-on-primary-container/80 text-xs">
            <span>Escrow Protected</span>
            <div className="flex items-center gap-1 font-label-sm text-[11px]">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>256-bit Encrypted</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-space-xl flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between mb-space-md pb-2 border-b border-outline-variant/20">
              <div className="inline-flex p-1 bg-surface-container-low rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className={`px-space-md py-1.5 rounded-lg font-label-md transition-all ${
                    mode === 'signin'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className={`px-space-md py-1.5 rounded-lg font-label-md transition-all ${
                    mode === 'register'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span>Secure Session</span>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-space-md">
                {/* Method selector: Email vs Name + PRN */}
                <div className="flex items-center gap-4 text-sm font-label-sm">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={loginMethod === 'email'}
                      onChange={() => setLoginMethod('email')}
                      className="text-primary accent-primary"
                    />
                    <span>Email & Password</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={loginMethod === 'prn'}
                      onChange={() => setLoginMethod('prn')}
                      className="text-primary accent-primary"
                    />
                    <span>Name + Student ID / PRN</span>
                  </label>
                </div>

                {loginMethod === 'email' ? (
                  <>
                    {/* Email Input */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-on-surface-variant">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="student@gmail.com or name@edu"
                          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                          mail
                        </span>
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="font-label-md text-on-surface-variant">Password</label>
                        <Link
                          to="/request-reset"
                          className="font-label-sm text-primary hover:underline text-xs"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                          lock
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="Toggle password visibility"
                          className="absolute right-3 top-2.5 p-1 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Name Input */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-on-surface-variant">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="e.g. Vishnu Pund"
                          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                          person
                        </span>
                      </div>
                    </div>

                    {/* PRN Input */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-on-surface-variant">
                        Student ID / PRN
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={prnInput}
                          onChange={(e) => setPrnInput(e.target.value)}
                          placeholder="e.g. 12345678"
                          className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                          badge
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <span>{loading ? 'Signing in...' : 'Sign In to Recampus'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Full Legal Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant">Full Legal Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Vishnu Pund"
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
                      badge
                    </span>
                  </div>
                </div>

                {/* Student Email Address */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant">
                    Campus / Student Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@student.edu or user@gmail.com"
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
                      mail
                    </span>
                  </div>
                </div>

                {/* Optional Student ID / PRN */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-on-surface-variant">
                    Student ID / PRN (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="e.g. 12345678"
                      className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
                      school
                    </span>
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-on-surface-variant">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-md text-on-surface-variant">Confirm</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {regPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs font-label-sm">
                      <span className="text-on-surface-variant">Security Strength:</span>
                      <span className={passwordStrength.color}>{passwordStrength.text}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 1 ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 2 ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 3
                            ? 'bg-tertiary-container'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none text-xs font-body-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 text-primary accent-primary"
                  />
                  <span>
                    I agree to the Recampus Code of Conduct, Campus Verification Standards, and Escrow Protections.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            )}
          </div>

          {/* Bottom Trust Strip */}
          <div className="mt-space-md pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-on-surface-variant font-label-sm text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-tertiary-container">
                lock
              </span>
              <span>256-bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                verified
              </span>
              <span>Campus Verified Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
