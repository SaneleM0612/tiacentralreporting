import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import CreateAccountPage from './components/CreateAccountPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { TeamMember, Role, Region, Cluster } from './types';
import { sheetsApi } from './lib/googleSheets';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [view, setView] = useState<'login' | 'createAccount'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (msisdn: string) => {
    const result = await sheetsApi.getUser(msisdn);
    if (result.error) {
       // Simulate Supabase error structure for compatibility or handle explicitly
       const errorObj: any = new Error(result.error);
       if (result.code) errorObj.code = result.code;
       throw errorObj;
    }
    return result.data as TeamMember;
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const loggedInUserMsisdn = sessionStorage.getItem('loggedInUser');
      if (loggedInUserMsisdn) {
        try {
          const userProfile = await fetchUser(loggedInUserMsisdn);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Session check failed, logging out:", error);
          sessionStorage.removeItem('loggedInUser');
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [fetchUser]);

  const handleLogin = useCallback(async (msisdn: string) => {
    setAuthError(null);
    if (!msisdn || msisdn.length !== 11) {
      setAuthError("MSISDN must be an 11-digit number.");
      return;
    }
    
    try {
        const user = await fetchUser(msisdn);
        setCurrentUser(user);
        sessionStorage.setItem('loggedInUser', user.msisdn);
    } catch (error: any) {
        // 'PGRST116' is the Supabase code we simulate in GAS for "not found"
        if (error && error.code === 'PGRST116') {
             setAuthError("No account found with this MSISDN. Please create an account.");
        } else {
            console.error("Login error:", error);
            const msg = error.message === '[object Object]' ? 'Connection Error (Check Script URL)' : error.message;
            setAuthError(`An error occurred: ${msg}. Please contact an administrator.`);
        }
    }
  }, [fetchUser]);

  const handleCreateAccount = useCallback(async (details: Omit<TeamMember, 'role' | 'region' | 'cluster'> & { role: Role | '', region: Region | '', cluster: Cluster | ''}) => {
    setAuthError(null);
    if (!details.msisdn || details.msisdn.length !== 11) {
        setAuthError("MSISDN must be an 11-digit number.");
        return;
    }
    if (!details.momoNumber || details.momoNumber.length !== 11) {
        setAuthError("Momo number must be an 11-digit number.");
        return;
    }
    if (!details.fullName.trim()) {
        setAuthError("Full Name cannot be empty.");
        return;
    }
    if (!details.role || !details.region || !details.cluster) {
        setAuthError("Please select a Role, Region, and Cluster.");
        return;
    }

    // Attempt to create
    const result = await sheetsApi.createUser({
        msisdn: details.msisdn,
        fullName: details.fullName,
        role: details.role,
        region: details.region,
        cluster: details.cluster,
        momoNumber: details.momoNumber,
    });

    if (result.error) {
      // Use the specific error message from the API if available
      const errorMsg = typeof result.error === 'string' 
        ? result.error 
        : (result.error?.message || "Failed to create account. User may already exist or connection failed.");
      
      setAuthError(errorMsg);
    } else {
      setView('login');
      setAuthError(null); 
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('loggedInUser');
    setView('login');
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-pink-50">
            <p className="text-pink-600 font-semibold">Loading...</p>
        </div>
    );
  }

  if (currentUser) {
    if (currentUser.role === Role.Admin) {
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen">
      {view === 'login' ? (
        <LoginPage 
          onLogin={handleLogin} 
          onNavigateToCreateAccount={() => { setView('createAccount'); setAuthError(null); }}
          error={authError} 
        />
      ) : (
        <CreateAccountPage 
          onCreateAccount={handleCreateAccount} 
          onNavigateToLogin={() => { setView('login'); setAuthError(null); }}
          error={authError}
        />
      )}
    </div>
  );
};

export default App;