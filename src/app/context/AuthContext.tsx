// context/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserEncryptionKey } from "../lib/crypto"; // Fix this path

interface User {
  id: string;
  username: string;
  email: string;
  encryptionSalt: string;
}

interface AuthContextType {
  user: User | null;
  encryptionKey: CryptoKey | null;
  login: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
      
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userData: any) => {
    try {
    
      const key = await getUserEncryptionKey(password, userData.encryptionSalt);
      
      const userInfo: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        encryptionSalt: userData.encryptionSalt
      };
      
      setUser(userInfo);
      setEncryptionKey(key);
      
 
      localStorage.setItem("userData", JSON.stringify(userInfo));
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Failed to initialize encryption. Please check your password.");
    }
  };

  const logout = () => {
    setUser(null);
    setEncryptionKey(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ user, encryptionKey, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}