// src/contexts/UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import DatabaseService from '../services/DatabaseService';
import MigrationService from '../services/MigrationService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Initialize database
        await DatabaseService.init();
        setDbInitialized(true);
        
        // 2. Migrate data from localStorage to database
        await MigrationService.migrateLocalStorageToDatabase();
        
        // 3. Check if user is already logged in
        const storedAuth = localStorage.getItem('userAuth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          
          // 4. Get user data from database
          const userData = await DatabaseService.getUserByUsername(authData.username);
          
          if (userData) {
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    
    return () => {
      // Clean up
      DatabaseService.close();
    };
  }, []);

  const login = async (username) => {
    try {
      // In this app, we just check if the user exists
      let user = await DatabaseService.getUserByUsername(username);
      
      if (!user) {
        // Auto-create user if not found
        const userId = await DatabaseService.createUser(username, 'parent');
        user = await DatabaseService.getUserById(userId);
      }
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('userAuth', JSON.stringify({
          username: user.username,
          role: user.role
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, role = 'parent') => {
    try {
      // Check if user already exists
      const existingUser = await DatabaseService.getUserByUsername(username);
      
      if (existingUser) {
        return { success: false, message: 'این نام کاربری قبلاً ثبت شده است' };
      }
      
      // Create new user
      const userId = await DatabaseService.createUser(username, role);
      
      if (userId) {
        const newUser = await DatabaseService.getUserById(userId);
        setCurrentUser(newUser);
        
        localStorage.setItem('userAuth', JSON.stringify({
          username: newUser.username,
          role: newUser.role
        }));
        
        return { success: true };
      }
      
      return { success: false, message: 'خطا در ایجاد کاربر' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'خطا در ثبت‌نام' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userAuth');
  };

  const value = {
    currentUser,
    isLoading,
    dbInitialized,
    login,
    register,
    logout
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};