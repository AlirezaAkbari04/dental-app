import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import ChildProfile from './components/auth/ChildProfile';
import ParentProfile from './components/auth/ParentProfile';
import TeacherProfile from './components/auth/TeacherProfile';
import ChildDashboard from './components/dashboards/ChildDashboard';
import CaretakerDashboard from './components/dashboards/CaretakerDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';

// Simple auth check - in a real app, you would use a more robust solution
const isAuthenticated = () => {
  return localStorage.getItem('userAuth') !== null;
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="app" dir="rtl">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
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
              <ProtectedRoute>
                <ChildProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/parent" 
            element={
              <ProtectedRoute>
                <ParentProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/teacher" 
            element={
              <ProtectedRoute>
                <TeacherProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard routes */}
          <Route 
            path="/dashboard/child" 
            element={
              <ProtectedRoute>
                <ChildDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/caretaker" 
            element={
              <ProtectedRoute>
                <CaretakerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/parent" 
            element={
              <ProtectedRoute>
                <ParentDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;