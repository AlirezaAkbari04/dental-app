// src/contexts/UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import DatabaseService from '../services/DatabaseService';
import MigrationService from '../services/MigrationService';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Close any existing connections first
        await DatabaseService.close();
        
        // Reset the database to ensure a fresh connection
        if (Capacitor.isNativePlatform()) {
          await DatabaseService.resetDatabase();
        } else {
          await DatabaseService.init();
        }
        
        setDbInitialized(true);
        
        // Migrate data from localStorage to database
        await MigrationService.migrateLocalStorageToDatabase();
        
        // Check if user is already logged in - use Capacitor Preferences for native platforms
        let authData = null;

        if (Capacitor.isNativePlatform()) {
          // Get from Capacitor Preferences for native platforms
          const { value } = await Preferences.get({ key: 'userAuth' });
          if (value) {
            authData = JSON.parse(value);
          }
        } else {
          // Use localStorage for web
          const storedAuth = localStorage.getItem('userAuth');
          if (storedAuth) {
            authData = JSON.parse(storedAuth);
          }
        }
        
        if (authData) {
          // Get user data from database
          const userData = await DatabaseService.getUserByUsername(authData.username);
          
          if (userData) {
            console.log("Found stored user:", userData);
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

  // Save auth data to both localStorage and Preferences
  const saveAuthData = async (data) => {
    const authString = JSON.stringify(data);
    
    // Save to localStorage (web)
    localStorage.setItem('userAuth', authString);
    
    // Save to Preferences (native)
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({
        key: 'userAuth',
        value: authString
      });
    }
  };

  // Clear auth data from both localStorage and Preferences
  const clearAuthData = async () => {
    localStorage.removeItem('userAuth');
    
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: 'userAuth' });
    }
  };

  const login = async (username) => {
    try {
      console.log("Logging in user:", username);
      
      // If on native platform, ensure database is ready
      if (Capacitor.isNativePlatform() && !dbInitialized) {
        console.log("Resetting database before login");
        await DatabaseService.resetDatabase();
        setDbInitialized(true);
      }
      
      // Check if user exists
      let user = await DatabaseService.getUserByUsername(username);
      
      if (!user) {
        console.log("User not found, creating new user");
        // Auto-create user if not found
        const userId = await DatabaseService.createUser(username, 'parent');
        user = await DatabaseService.getUserById(userId);
      } else {
        console.log("User found:", user);
      }
      
      if (user) {
        setCurrentUser(user);
        await saveAuthData({
          username: user.username,
          role: user.role
        });
        console.log("User logged in successfully");
        return true;
      }
      
      console.log("Login failed - user object is null");
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, role = 'parent') => {
    try {
      console.log("Starting registration for:", username);
      
      // If on native platform, ensure database is ready
      if (Capacitor.isNativePlatform() && !dbInitialized) {
        console.log("Resetting database before registration");
        await DatabaseService.resetDatabase();
        setDbInitialized(true);
      }
      
      // Check if user already exists
      console.log("Checking if user already exists");
      const existingUser = await DatabaseService.getUserByUsername(username);
      
      if (existingUser) {
        console.log("User already exists:", existingUser);
        return { success: false, message: 'این نام کاربری قبلاً ثبت شده است' };
      }
      
      // Create new user
      console.log("Creating new user");
      const userId = await DatabaseService.createUser(username, role);
      
      if (userId) {
        console.log("User created successfully with ID:", userId);
        
        // Get the complete user data
        const newUser = await DatabaseService.getUserById(userId);
        
        if (newUser) {
          console.log("Retrieved new user data:", newUser);
          setCurrentUser(newUser);
          
          // Store auth data
          await saveAuthData({
            username: newUser.username,
            role: newUser.role
          });
          
          return { success: true };
        } else {
          console.error("Failed to retrieve user after creation");
        }
      }
      
      console.error("Failed to create user, no user ID returned");
      return { success: false, message: 'خطا در ایجاد کاربر' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'خطا در ثبت‌نام' };
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await clearAuthData();
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