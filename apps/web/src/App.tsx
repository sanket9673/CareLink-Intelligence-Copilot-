import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Report } from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<div className="p-8 text-slate-400 font-medium">Insights Page Coming Soon</div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<div className="p-8 text-slate-400 font-medium">Settings Page Coming Soon</div>} />
        </Route>

        {/* Standalone Route (Outside AppLayout) */}
        <Route path="/reports/:patientId" element={<Report />} />

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
