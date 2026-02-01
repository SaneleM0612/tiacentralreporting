import React, { useState } from 'react';
import { TeamMember, Role, Region, Cluster } from '../types';
import { ROLES, REGIONS, CLUSTERS } from '../constants';
import BackIcon from './icons/BackIcon';
import UserPlusIcon from './icons/UserPlusIcon';

interface CreateAccountPageProps {
  onCreateAccount: (details: Omit<TeamMember, 'msisdn'> & { msisdn: string }) => void;
  onNavigateToLogin: () => void;
  error: string | null;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onCreateAccount, onNavigateToLogin, error }) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [region, setRegion] = useState<Region | ''>('');
  const [cluster, setCluster] = useState<Cluster | ''>('');
  const [momoNumber, setMomoNumber] = useState('');
  const [msisdn, setMsisdn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role && region && cluster) {
      onCreateAccount({ fullName, role, region, cluster, momoNumber, msisdn });
    }
  };

  const inputStyles = "block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-pink-600 focus:text-white focus:placeholder-pink-200 focus:border-transparent bg-white transition-colors duration-200";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 space-y-6 relative">
        <button 
          onClick={onNavigateToLogin} 
          className="absolute top-8 left-8 flex items-center space-x-2 text-sm text-gray-500 hover:text-pink-600 transition-colors"
          aria-label="Go back to login"
        >
          <BackIcon className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="flex flex-col items-center pt-12">
            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-500 mt-1">Register as a new team member</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              id="fullName" 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
              placeholder="Enter your full name"
              className={`mt-1 ${inputStyles}`}
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)} 
              required 
              className={`mt-1 ${inputStyles} ${!role ? 'text-gray-500' : 'text-gray-900'}`}
            >
              <option value="" disabled>Select role</option>
              {ROLES.map(r => <option key={r} value={r} className="text-gray-900">{r}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
            <select 
              id="region" 
              value={region} 
              onChange={(e) => setRegion(e.target.value as Region)} 
              required 
              className={`mt-1 ${inputStyles} ${!region ? 'text-gray-500' : 'text-gray-900'}`}
            >
               <option value="" disabled>Select region</option>
              {REGIONS.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="cluster" className="block text-sm font-medium text-gray-700">Cluster</label>
            <select 
              id="cluster" 
              value={cluster} 
              onChange={(e) => setCluster(e.target.value as Cluster)} 
              required 
              className={`mt-1 ${inputStyles} ${!cluster ? 'text-gray-500' : 'text-gray-900'}`}
            >
               <option value="" disabled>Select cluster</option>
              {CLUSTERS.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="momoNumber" className="block text-sm font-medium text-gray-700">Momo Number (11 digits)</label>
            <input 
              id="momoNumber" 
              type="tel" 
              value={momoNumber} 
              onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              required 
              placeholder="Enter 11-digit number"
              className={`mt-1 ${inputStyles}`}
            />
          </div>
          
          <div>
            <label htmlFor="msisdn-create" className="block text-sm font-medium text-gray-700">MSISDN (11 digits)</label>
            <input 
              id="msisdn-create" 
              type="tel" 
              value={msisdn} 
              onChange={(e) => setMsisdn(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              required 
              placeholder="Enter 11-digit number"
              className={`mt-1 ${inputStyles}`}
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;