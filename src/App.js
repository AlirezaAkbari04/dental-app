// src/App.js - FIXED VERSION
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
import AboutUs from './components/AboutUs';

function AppContent() {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator"></div>
        <p>Loading...</p>
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

  const ProtectedRoute = ({ children, requiresAuth = true, requiresRole = false, requiresProfile = false, specificRole = null }) => {
    console.log('[ProtectedRoute] Check:', {
      currentUser: currentUser?.username,
      currentUserRole: currentUser?.role,
      profileCompleted: currentUser?.profileCompleted,
      requiresAuth,
      requiresRole,
      requiresProfile,
      specificRole
    });

    // If authentication is required and no user is logged in
    if (requiresAuth && !currentUser) {
      console.log('[ProtectedRoute] No user, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    // If role is required but user has no role
    if (requiresRole && currentUser && !currentUser.role) {
      console.log('[ProtectedRoute] No role, redirecting to role selection');
      return <Navigate to="/role-selection" replace />;
    }

    // If profile completion is required but profile is not completed
    if (requiresProfile && currentUser && !currentUser.profileCompleted) {
      console.log('[ProtectedRoute] Profile not completed, redirecting to profile form');
      if (currentUser.role) {
        return <Navigate to={`/profile/${currentUser.role}`} replace />;
      }
      return <Navigate to="/role-selection" replace />;
    }

    // If specific role is required and doesn't match
    if (specificRole && currentUser && currentUser.role !== specificRole) {
      console.log(`[ProtectedRoute] Role mismatch: required ${specificRole}, got ${currentUser.role}`);
      // If user has completed profile, go to their dashboard
      if (currentUser.profileCompleted) {
        return <Navigate to={getDashboardPath(currentUser.role)} replace />;
      }
      // Otherwise, go to their profile form
      return <Navigate to={`/profile/${currentUser.role}`} replace />;
    }

    // All checks passed
    return children;
  };

  // Handle auth pages (login/register) - redirect if already logged in
  const AuthRoute = ({ children }) => {
    if (currentUser) {
      // User is logged in
      if (!currentUser.role) {
        // No role selected yet
        return <Navigate to="/role-selection" replace />;
      } else if (!currentUser.profileCompleted) {
        // Role selected but profile not completed
        return <Navigate to={`/profile/${currentUser.role}`} replace />;
      } else {
        // Everything complete, go to dashboard
        return <Navigate to={getDashboardPath(currentUser.role)} replace />;
      }
    }
    // Not logged in, show auth page
    return children;
  };

  // Default route handler
  const DefaultRoute = () => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    if (!currentUser.role) {
      return <Navigate to="/role-selection" replace />;
    }

    if (!currentUser.profileCompleted) {
      return <Navigate to={`/profile/${currentUser.role}`} replace />;
    }

    return <Navigate to={getDashboardPath(currentUser.role)} replace />;
  };

  return (
    <div className="app">
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
        
        {/* Role selection - requires auth but not role */}
        <Route 
          path="/role-selection" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={false} requiresProfile={false}>
              <RoleSelection />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile completion routes - requires auth and role but not completed profile */}
        <Route 
          path="/profile/child" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={false} specificRole="child">
              <ChildProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/parent" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={false} specificRole="parent">
              <ParentProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile/teacher" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={false} specificRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard routes - requires auth, role, and completed profile */}
        <Route 
          path="/dashboard/child" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={true} specificRole="child">
              <ChildDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/caretaker" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={true} specificRole="teacher">
              <CaretakerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/parent" 
          element={
            <ProtectedRoute requiresAuth={true} requiresRole={true} requiresProfile={true} specificRole="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* FAQ and About Us routes - accessible to all */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about-us" element={<AboutUs />} />
        
        {/* Additional dashboard routes for compatibility */}
        <Route path="/child-dashboard" element={<Navigate to="/dashboard/child" replace />} />
        <Route path="/parent-dashboard" element={<Navigate to="/dashboard/parent" replace />} />
        <Route path="/caretaker-dashboard" element={<Navigate to="/dashboard/caretaker" replace />} />
        
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