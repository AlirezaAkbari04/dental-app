import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { initializeDatabase } from './services/initDatabase';
// ... existing imports ...

function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <Router>
      // ... existing code ...
    </Router>
  );
}

export default App; 