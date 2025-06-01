// src/contexts/UserContext.js - FLEXIBLE LOGIN VERSION
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
        
        if (authData && (authData.email || authData.phone)) {
          console.log('[UserContext] Found existing auth data:', authData);
          
          // Check if user has completed profile
          const profileCompleted = localStorage.getItem(`profile_completed_${authData.id}`);
          
          // Restore user session
          const userData = {
            id: authData.id || Date.now(),
            email: authData.email || null,
            phone: authData.phone || null,
            name: authData.name || '',
            role: authData.role || null,
            profileCompleted: profileCompleted === 'true'
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
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
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
      
      if (currentUser?.id) {
        localStorage.removeItem(`profile_completed_${currentUser.id}`);
      }
      
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

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper function to validate phone format
  const isValidPhone = (phone) => {
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Get user data from storage - UPDATED TO SEARCH BY EMAIL OR PHONE
  const getUserFromStorage = (credential) => {
    try {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      
      // Search by email or phone
      const user = users.find(user => {
        // Check if credential matches email
        if (user.email && user.email.toLowerCase() === credential.toLowerCase()) {
          return true;
        }
        // Check if credential matches phone
        if (user.phone && user.phone === credential) {
          return true;
        }
        return false;
      });
      
      console.log('[UserContext] getUserFromStorage - searching for:', credential, 'found:', user ? 'YES' : 'NO');
      return user || null;
    } catch (error) {
      console.error('[UserContext] Error reading users from storage:', error);
      return null;
    }
  };

  // Save user to storage - UPDATED TO STORE BOTH EMAIL AND PHONE
  const saveUserToStorage = (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const existingIndex = users.findIndex(user => user.id === userData.id);
      
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

  // UPDATED LOGIN FUNCTION - ACCEPTS EMAIL OR PHONE
  const login = async (credentials) => {
    try {
      console.log('[UserContext] Starting login process...', credentials);
      
      const credential = typeof credentials === 'string' ? credentials : credentials.username;
      
      if (!credential || !credential.trim()) {
        console.error('[UserContext] No credential provided');
        return false;
      }
      
      // Check if user exists in storage (search by email or phone)
      let user = getUserFromStorage(credential.trim());
      
      if (!user) {
        console.log('[UserContext] User not found in storage for credential:', credential);
        return false;
      }
      
      // Check if user has completed profile
      const profileCompleted = localStorage.getItem(`profile_completed_${user.id}`);
      user.profileCompleted = profileCompleted === 'true';
      
      console.log('[UserContext] Login successful:', user);
      setCurrentUser(user);
      await saveAuthData(user);
      
      return true;
    } catch (error) {
      console.error('[UserContext] Login error:', error);
      return false;
    }
  };

  // UPDATED REGISTER FUNCTION - ACCEPTS FULL USER DATA WITH EMAIL AND PHONE
  const register = async (userData) => {
    try {
      console.log('[UserContext] Starting registration:', userData);
      
      // userData should now contain: { email, phone, name, password }
      const { email, phone, name } = userData;
      
      if (!name || !name.trim()) {
        console.error('[UserContext] No name provided');
        return false;
      }
      
      // Must have at least email or phone
      if (!email && !phone) {
        console.error('[UserContext] No email or phone provided');
        return false;
      }
      
      // Validate email format if provided
      if (email && !isValidEmail(email)) {
        console.error('[UserContext] Invalid email format');
        return false;
      }
      
      // Validate phone format if provided
      if (phone && !isValidPhone(phone)) {
        console.error('[UserContext] Invalid phone format');
        return false;
      }
      
      // Check if user already exists with this email or phone
      if (email && getUserFromStorage(email)) {
        console.log('[UserContext] User already exists with this email');
        return false;
      }
      
      if (phone && getUserFromStorage(phone)) {
        console.log('[UserContext] User already exists with this phone');
        return false;
      }
      
      // Create new user with both email and phone
      const newUser = {
        id: Date.now(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        name: name.trim(),
        role: null, // No role initially
        profileCompleted: false,
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
      const updatedUser = { 
        ...currentUser, 
        role: newRole,
        profileCompleted: false // Mark profile as not completed when role changes
      };
      
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

  const markProfileAsCompleted = async () => {
    try {
      if (!currentUser) {
        console.error('[UserContext] No current user to mark profile as completed');
        return false;
      }
      
      console.log('[UserContext] Marking profile as completed for user:', currentUser.id);
      
      // Update profile completion status
      localStorage.setItem(`profile_completed_${currentUser.id}`, 'true');
      
      // Update current user
      const updatedUser = { 
        ...currentUser, 
        profileCompleted: true
      };
      
      // Save to storage
      saveUserToStorage(updatedUser);
      
      // Update state
      setCurrentUser(updatedUser);
      
      console.log('[UserContext] Profile marked as completed');
      return true;
    } catch (error) {
      console.error('[UserContext] Error marking profile as completed:', error);
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
    updateUserRole,
    markProfileAsCompleted
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