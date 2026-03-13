import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { Link } from '@/lib/router';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const { navigate } = useRouter();
  const { login } = useAuth();
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement customer login logic
    console.log('Customer login:', { email: customerEmail, password: customerPassword });
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth
    console.log('Google sign in clicked');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset logic
    console.log('Password reset for:', resetEmail);
    alert('Password reset link sent to ' + resetEmail);
    setShowForgotPassword(false);
    setResetEmail('');
  };

  if (showForgotPassword) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h1>
            <p className="text-slate-500">Enter your email to receive a reset link</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  placeholder="name@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-slate-50/50 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                Send Reset Link
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-slate-500 hover:text-black font-semibold transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to your account to continue</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <h2 className="text-xl font-bold mb-6 text-center text-slate-900">Sign In</h2>
            <form onSubmit={handleCustomerLogin} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
                </label>
                <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-slate-50/50 focus:bg-white transition-all outline-none"
                required
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-slate-500 hover:text-black font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-black/5 focus:border-black bg-slate-50/50 focus:bg-white transition-all outline-none"
                required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
                Sign In
            </button>
            </form>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">Or continue with</span>
                </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border-2 border-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            {/* Create Account Link */}
            <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link 
                    to="/register" 
                    className="text-black font-bold hover:text-[#4567a4] transition-colors"
                >
                    Create account
                </Link>
            </p>
            </div>
        </div>

        {/* Demo Access - Moved to Bottom */}
        <div className="mt-6">
            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 px-3 text-slate-400 font-bold tracking-wider">Demo Access</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => {
                        login('customer');
                        const searchParams = new URLSearchParams(window.location.search);
                        const redirect = searchParams.get('redirect');
                        navigate(redirect || '/account');
                    }}
                    className="w-full bg-white text-slate-700 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors border-2 border-slate-200 shadow-sm"
                >
                    Customer Demo
                </button>
                <button
                    onClick={() => {
                        login('admin');
                        navigate('/admin');
                    }}
                    className="w-full bg-[#4567a4]/10 text-[#4567a4] py-2.5 rounded-lg text-sm font-bold hover:bg-[#4567a4]/20 transition-colors border border-[#4567a4]/30 shadow-sm"
                >
                    Admin Demo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
