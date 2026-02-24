import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Signup from './components/Signup';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Chatbot context={{ system: "TerraFlow v1.0", location: "Greenhouse Alpha" }} />
      </div>
    </BrowserRouter>
  );
}
