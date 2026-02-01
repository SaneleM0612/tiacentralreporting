import React, { useState } from 'react';
import SignInIcon from './icons/SignInIcon';

interface LoginPageProps {
  onLogin: (msisdn: string) => void;
  onNavigateToCreateAccount: () => void;
  error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToCreateAccount, error }) => {
  const [msisdn, setMsisdn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(msisdn);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center">
                <SignInIcon className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-500">Enter your MSISDN to access your account</p>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
          <div>
            <label htmlFor="msisdn" className="block text-sm font-medium text-gray-700">MSISDN (11 digits)</label>
            <input
              id="msisdn"
              type="tel"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-pink-600 focus:text-white focus:placeholder-pink-200 focus:border-transparent bg-white transition-colors duration-200"
              placeholder="Enter 11-digit number"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
          >
            <SignInIcon className="w-5 h-5 mr-2" />
            <span>Sign In</span>
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button onClick={onNavigateToCreateAccount} className="font-medium text-pink-600 hover:text-pink-500">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;