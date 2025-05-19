// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import FAQ from './components/FAQ'; // Import the FAQ component

function AppContent() {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-indicator"></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    // Get role from localStorage as backup
    const storedRole = localStorage.getItem('userRole');
    
    // Use the most recent role - either from localStorage or currentUser
    const effectiveRole = storedRole || currentUser.role;
    
    if (requiredRole && effectiveRole !== requiredRole) {
      // Handle different user roles by redirecting to the appropriate dashboard
      if (effectiveRole === 'child') {
        return <Navigate to="/dashboard/child" replace />;
      } else if (effectiveRole === 'parent') {
        return <Navigate to="/dashboard/parent" replace />;
      } else if (effectiveRole === 'teacher') {
        return <Navigate to="/dashboard/caretaker" replace />;
      } else {
        // If no effective role is found, redirect to role selection
        return <Navigate to="/role-selection" replace />;
      }
    }
    
    return children;
  };

  return (
    <div className="app" dir="rtl">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={currentUser ? <Navigate to={`/dashboard/${currentUser.role}`} /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to={`/dashboard/${currentUser.role}`} /> : <Register />} />
        
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
        <Route path="/" element={
          currentUser 
            ? <Navigate to={`/dashboard/${currentUser.role}`} replace /> 
            : <Navigate to="/login" replace />
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
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