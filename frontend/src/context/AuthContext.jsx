import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bizos_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  // Track whether login/register already loaded the user, so the useEffect doesn't double-fire
  const skipNextAutoLoad = useRef(false);

  // Set default auth headers for all fetch requests or utility methods
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Automatic logout on unauthorized status
      handleLogout();
    }

    return response;
  }, [token]);

  const loadCurrentUser = async (currentToken) => {
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setUser(result.data);
        return true;
      } else {
        console.warn('loadCurrentUser: API returned failure', result.message);
        handleLogout();
        return false;
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      handleLogout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // On initial mount or when token changes from an external source (e.g. localStorage)
  useEffect(() => {
    if (skipNextAutoLoad.current) {
      skipNextAutoLoad.current = false;
      return;
    }
    if (token) {
      loadCurrentUser(token);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      if (result.success && result.token) {
        // Mark that we will load the user ourselves — skip the useEffect auto-load
        skipNextAutoLoad.current = true;
        localStorage.setItem('bizos_token', result.token);
        setToken(result.token);
        await loadCurrentUser(result.token);
        return { success: true, isSuperAdmin: result.isSuperAdmin === true, role: result.data?.role };
      } else {
        setIsLoading(false);
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'Connection to auth server failed. Please try again.' };
    }
  };

  const register = async (name, email, password, businessName, role, businessId, designation, superAdminId, plan) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, businessName, role, businessId, designation, superAdminId, plan }),
      });

      const result = await response.json();
      if (result.success && result.token) {
        // Mark that we will load the user ourselves — skip the useEffect auto-load
        skipNextAutoLoad.current = true;
        localStorage.setItem('bizos_token', result.token);
        setToken(result.token);
        // Seed session immediately so role-based navigation renders correctly
        if (result.data) {
          setUser(result.data);
        }
        const loaded = await loadCurrentUser(result.token);
        if (!loaded) {
          return { success: false, message: 'Account created but session failed to load. Please sign in.' };
        }
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false, message: 'Connection to registration server failed. Please try again.' };
    }
  };

  const handleLogout = useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bizos_token');
    setIsLoading(false);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'SuperAdmin',
    isLoading,
    login,
    register,
    logout: handleLogout,
    authFetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
