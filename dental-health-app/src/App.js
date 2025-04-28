import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoleSelection from './components/auth/RoleSelection';
import ChildDashboard from './components/dashboards/ChildDashboard';
import ParentDashboard from './components/dashboards/ParentDashboard';
import CaretakerDashboard from './components/dashboards/CaretakerDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/dashboard/child" element={<ChildDashboard />} />
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/caretaker" element={<CaretakerDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;