// src/App.js - SIMPLIFIED FIXED VERSION
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { UserProvider } from './contexts/UserContext';
import { useUser } from './contexts/UserContext';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import ChildProfile from './components/auth/ChildProfile';
import ParentProfile from './components/auth/ParentProfile';
import TeacherProfile from './components/auth/TeacherProfile';
import ChildDashboard from './components/dashboards/ChildDashboard';
import CaretakerDashboard from './components/dashboards/CaretakerDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import FAQ from './components/FAQ';

function AppContent() {
  const { currentUser, isLoading } = useUser();
  const navigate = useNavigate();

  // Handle navigation based on user state changes
  useEffect(() => {
    if (!isLoading && currentUser) {
      console.log('[App] User state changed:', currentUser);
      
      if (!currentUser.role) {
        // User logged in but no role selected
        console.log('[App] User has no role, navigating to role selection');
        navigate('/role-selection');
      } else {
        // User has role, navigate to appropriate dashboard
        const dashboardPath = getDashboardPath(currentUser.role);
        console.log('[App] User has role, navigating to:', dashboardPath);
        navigate(dashboardPath);
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  // Helper function to get dashboard path based on role
  const getDashboardPath = (role) => {
    switch (role) {
      case 'child':
        return '/dashboard/child';
      case 'parent':
        return '/dashboard/parent';
      case 'teacher':
        return '/dashboard/caretaker';
      default:
        return '/role-selection';
    }
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    console.log('[ProtectedRoute] Check:', {
      currentUser: currentUser?.username,
      currentUserRole: currentUser?.role,
      requiredRole
    });

    // If no user is logged in, redirect to login
    if (!currentUser) {
      console.log('[ProtectedRoute] No current user, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // If no role is set and we're not on role selection, redirect to role selection
    if (!currentUser.role && requiredRole) {
      console.log('[ProtectedRoute] No role set, redirecting to role selection');
      return <Navigate to="/role-selection" replace />;
    }
    
    // If a specific role is required and it doesn't match
    if (requiredRole && currentUser.role && currentUser.role !== requiredRole) {
      console.log(`[ProtectedRoute] Role mismatch: required ${requiredRole}, got ${currentUser.role}`);
      // Redirect to the appropriate dashboard for the user's actual role
      return <Navigate to={getDashboardPath(currentUser.role)} replace />;
    }
    
    // All checks passed, render the protected content
    return children;
  };

  // Handle redirects for logged-in users on auth pages
  const LoginRoute = () => {
    if (currentUser) {
      if (currentUser.role) {
        return <Navigate to={getDashboardPath(currentUser.role)} replace />;
      } else {
        return <Navigate to="/role-selection" replace />;
      }
    }
    return <Login />;
  };

  const RegisterRoute = () => {
    if (currentUser) {
      if (currentUser.role) {
        return <Navigate to={getDashboardPath(currentUser.role)} replace />;
      } else {
        return <Navigate to="/role-selection" replace />;
      }
    }
    return <Register />;
  };

  // Default route handler
  const DefaultRoute = () => {
    if (currentUser) {
      if (currentUser.role) {
        return <Navigate to={getDashboardPath(currentUser.role)} replace />;
      } else {
        return <Navigate to="/role-selection" replace />;
      }
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <div className="app" dir="rtl">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        
        {/* Protected routes */}
        <Route 
          path="/role-selection" 
          element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile completion routes */}
        <Route 
          path="/profile/child" 
          element={
            <ProtectedRoute requiredRole="child">
              <ChildProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/parent" 
          element={
            <ProtectedRoute requiredRole="parent">
              <ParentProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/teacher" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard routes */}
        <Route 
          path="/dashboard/child" 
          element={
            <ProtectedRoute requiredRole="child">
              <ChildDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/caretaker" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <CaretakerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/parent" 
          element={
            <ProtectedRoute requiredRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* FAQ route - accessible to all users */}
        <Route path="/faq" element={<FAQ />} />
        
        {/* Default redirect */}
        <Route path="/" element={<DefaultRoute />} />
        
        {/* Fallback for unmatched routes */}
        <Route path="*" element={<DefaultRoute />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;