import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/identity';

interface InternetIdentityContextType {
  identity: Identity | null;
  login: () => Promise<void>;
  clear: () => Promise<void>;
  isLoggingIn: boolean;
  loginStatus: 'initializing' | 'logged-in' | 'logged-out';
}

const InternetIdentityContext = createContext<InternetIdentityContextType | undefined>(undefined);

export function InternetIdentityProvider({ children }: { children: ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'initializing' | 'logged-in' | 'logged-out'>('initializing');

  useEffect(() => {
    async function init() {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        if (await client.isAuthenticated()) {
          setIdentity(client.getIdentity());
          setLoginStatus('logged-in');
        } else {
          setLoginStatus('logged-out');
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error);
        setLoginStatus('logged-out');
      }
    }
    init();
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    setIsLoggingIn(true);
    try {
      await authClient.login({
        identityProvider: process.env.II_URL || 'https://identity.internetcomputer.org',
        onSuccess: () => {
          setIdentity(authClient.getIdentity());
          setLoginStatus('logged-in');
          setIsLoggingIn(false);
        },
        onError: (error) => {
          console.error('Login error:', error);
          setIsLoggingIn(false);
        },
      });
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoggingIn(false);
    }
  };

  const clear = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIdentity(null);
    setLoginStatus('logged-out');
  };

  return (
    <InternetIdentityContext.Provider value={{ identity, login, clear, isLoggingIn, loginStatus }}>
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity() {
  const context = useContext(InternetIdentityContext);
  if (context === undefined) {
    throw new Error('useInternetIdentity must be used within InternetIdentityProvider');
  }
  return context;
}
