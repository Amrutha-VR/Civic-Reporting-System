import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ReportForm from "./components/ReportForm";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  const [showReport, setShowReport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  return (
    <>
      <Navbar onReport={() => { if (!user) window.location.href = "/login"; else setShowReport(true); }} />
      <Routes>
        <Route path="/" element={<Home key={refreshKey} />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showReport && <ReportForm onClose={() => setShowReport(false)} onCreated={() => { setShowReport(false); setRefreshKey(k => k + 1); }} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
