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

  // Protected route component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && currentUser.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (currentUser.role === 'child') {
        return <Navigate to="/dashboard/child" replace />;
      } else if (currentUser.role === 'parent') {
        return <Navigate to="/dashboard/parent" replace />;
      } else if (currentUser.role === 'teacher') {
        return <Navigate to="/dashboard/caretaker" replace />;
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