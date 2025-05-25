// src/contexts/UserContext.js - SIMPLIFIED FIXED VERSION
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app and check for existing session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[UserContext] Starting app initialization...');
        
        // Check for existing auth data
        let authData = null;

        if (Capacitor.isNativePlatform()) {
          console.log('[UserContext] Checking Capacitor Preferences...');
          try {
            const { value } = await Preferences.get({ key: 'userAuth' });
            if (value) {
              authData = JSON.parse(value);
            }
          } catch (error) {
            console.error('[UserContext] Error reading from Preferences:', error);
          }
        } else {
          console.log('[UserContext] Checking localStorage...');
          const storedAuth = localStorage.getItem('userAuth');
          if (storedAuth) {
            authData = JSON.parse(storedAuth);
          }
        }
        
        if (authData && authData.username) {
          console.log('[UserContext] Found existing auth data:', authData);
          
          // Restore user session
          const userData = {
            id: authData.id || Date.now(), // Generate ID if not exists
            username: authData.username,
            role: authData.role || null
          };
          
          setCurrentUser(userData);
          console.log('[UserContext] User session restored:', userData);
        } else {
          console.log('[UserContext] No existing auth data found');
        }
      } catch (error) {
        console.error('[UserContext] Error initializing app:', error);
      } finally {
        setIsLoading(false);
        console.log('[UserContext] App initialization completed');
      }
    };

    initializeApp();
  }, []);

  // Save auth data to storage
  const saveAuthData = async (userData) => {
    try {
      const authData = {
        id: userData.id,
        username: userData.username,
        role: userData.role
      };
      
      const authString = JSON.stringify(authData);
      console.log('[UserContext] Saving auth data:', authData);
      
      // Save to localStorage (always available)
      localStorage.setItem('userAuth', authString);
      if (userData.role) {
        localStorage.setItem('userRole', userData.role);
      }
      
      // Save to Preferences (native only)
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({
          key: 'userAuth',
          value: authString
        });
      }
      
      console.log('[UserContext] Auth data saved successfully');
    } catch (error) {
      console.error('[UserContext] Error saving auth data:', error);
    }
  };

  // Clear auth data from storage
  const clearAuthData = async () => {
    try {
      console.log('[UserContext] Clearing auth data...');
      
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');
      
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key: 'userAuth' });
      }
      
      console.log('[UserContext] Auth data cleared successfully');
    } catch (error) {
      console.error('[UserContext] Error clearing auth data:', error);
    }
  };

  // Get user data from simple storage (localStorage as database)
  const getUserFromStorage = (username) => {
    try {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      return users.find(user => user.username === username) || null;
    } catch (error) {
      console.error('[UserContext] Error reading users from storage:', error);
      return null;
    }
  };

  // Save user to simple storage
  const saveUserToStorage = (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const existingIndex = users.findIndex(user => user.username === userData.username);
      
      if (existingIndex !== -1) {
        users[existingIndex] = userData;
      } else {
        users.push(userData);
      }
      
      localStorage.setItem('app_users', JSON.stringify(users));
      console.log('[UserContext] User saved to storage:', userData);
    } catch (error) {
      console.error('[UserContext] Error saving user to storage:', error);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[UserContext] Starting login process...', credentials);
      
      const username = typeof credentials === 'string' ? credentials : credentials.username;
      
      if (!username || !username.trim()) {
        console.error('[UserContext] No username provided');
        return false;
      }
      
      // Check if user exists in storage
      let user = getUserFromStorage(username);
      
      if (!user) {
        console.log('[UserContext] User not found in storage');
        return false;
      }
      
      console.log('[UserContext] Login successful:', user);
      setCurrentUser(user);
      await saveAuthData(user);
      
      return true;
    } catch (error) {
      console.error('[UserContext] Login error:', error);
      return false;
    }
  };

  const register = async (username) => {
    try {
      console.log('[UserContext] Starting registration:', username);
      
      if (!username || !username.trim()) {
        console.error('[UserContext] No username provided');
        return false;
      }
      
      // Check if user already exists
      const existingUser = getUserFromStorage(username);
      
      if (existingUser) {
        console.log('[UserContext] User already exists');
        return false;
      }
      
      // Create new user without role (will be set in role selection)
      const newUser = {
        id: Date.now(),
        username: username.trim(),
        role: null, // No role initially
        created_at: new Date().toISOString()
      };
      
      // Save to storage
      saveUserToStorage(newUser);
      
      console.log('[UserContext] Registration successful:', newUser);
      setCurrentUser(newUser);
      await saveAuthData(newUser);
      
      return true;
    } catch (error) {
      console.error('[UserContext] Registration error:', error);
      return false;
    }
  };

  const updateUserRole = async (newRole) => {
    try {
      if (!currentUser) {
        console.error('[UserContext] No current user to update role');
        return false;
      }
      
      console.log('[UserContext] Updating user role to:', newRole);
      
      // Update current user
      const updatedUser = { ...currentUser, role: newRole };
      
      // Save to storage
      saveUserToStorage(updatedUser);
      
      // Update state
      setCurrentUser(updatedUser);
      
      // Update stored auth data
      await saveAuthData(updatedUser);
      
      console.log('[UserContext] User role updated successfully');
      return true;
    } catch (error) {
      console.error('[UserContext] Error updating user role:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[UserContext] Starting logout process...');
      
      // Clear user state
      setCurrentUser(null);
      
      // Clear stored auth data
      await clearAuthData();
      
      console.log('[UserContext] Logout completed successfully');
    } catch (error) {
      console.error('[UserContext] Error during logout:', error);
      
      // Ensure state is cleared even if there's an error
      setCurrentUser(null);
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    updateUserRole
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};