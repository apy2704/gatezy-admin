import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveViewPage from './pages/LiveViewPage';
import VisitorLogPage from './pages/VisitorLogPage';
import FlatsPage from './pages/FlatsPage';
import ResidentsPage from './pages/ResidentsPage';
import GuardsPage from './pages/GuardsPage';
import SettingsPage from './pages/SettingsPage';

const PrivateLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ marginLeft: '250px', padding: '32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes */}
        <Route
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/live" element={<LiveViewPage />} />
          <Route path="/visitors" element={<VisitorLogPage />} />
          <Route path="/flats" element={<FlatsPage />} />
          <Route path="/residents" element={<ResidentsPage />} />
          <Route path="/guards" element={<GuardsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
