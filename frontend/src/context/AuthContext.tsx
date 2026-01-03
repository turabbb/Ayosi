import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session duration: 1 hour (3600000 ms)
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour
const STORAGE_KEYS = {
  adminStatus: 'jewel_admin',
  user: 'jewel_user',
  loginTime: 'jewel_login_time',
  token: 'jewel_token',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const adminStatus = localStorage.getItem(STORAGE_KEYS.adminStatus);
        const userData = localStorage.getItem(STORAGE_KEYS.user);
        const loginTime = localStorage.getItem(STORAGE_KEYS.loginTime);

        if (adminStatus === 'true' && userData && loginTime) {
          const sessionAge = Date.now() - parseInt(loginTime);
          if (sessionAge < SESSION_DURATION) {
            // Session is still valid
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setupSessionTimer();
          } else {
            // Session expired
            handleSessionExpiry();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Set up session timer when user logs in
  useEffect(() => {
    if (user) {
      setupSessionTimer();
    } else {
      clearSessionTimer();
    }

    return () => clearSessionTimer();
  }, [user]);

  const setupSessionTimer = () => {
    clearSessionTimer(); // Clear any existing timer

    const loginTime = localStorage.getItem(STORAGE_KEYS.loginTime);
    if (loginTime) {
      const sessionAge = Date.now() - parseInt(loginTime);
      const remainingTime = SESSION_DURATION - sessionAge;

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          handleSessionExpiry();
        }, remainingTime);
        setSessionTimer(timer);
      } else {
        handleSessionExpiry();
      }
    }
  };

  const clearSessionTimer = () => {
    if (sessionTimer) {
      clearTimeout(sessionTimer);
      setSessionTimer(null);
    }
  };

  const handleSessionExpiry = () => {
    toast({
      title: 'Session Expired',
      description: 'Your admin session has expired. Please log in again.',
      variant: 'destructive',
    });
    logout();
  };

  const saveSession = (userData: User, token?: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.adminStatus, 'true');
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.loginTime, Date.now().toString());
      if (token) {
        localStorage.setItem(STORAGE_KEYS.token, token);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const clearStoredSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.adminStatus);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.loginTime);
      localStorage.removeItem(STORAGE_KEYS.token);
    } catch (error) {
      console.error('Error clearing stored session:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);

      if (response._id) {
        const userData: User = {
          _id: response._id,
          username: response.username,
          email: response.email,
        };
        setUser(userData);
        saveSession(userData, response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearStoredSession();
      clearSessionTimer();
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(username, email, password);
      return response.message === 'User registered successfully';
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};