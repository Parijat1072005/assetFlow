import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import AllocationsPage from "./pages/AllocationsPage";
import BookingsPage from "./pages/BookingsPage";
import MaintenancePage from "./pages/MaintenancePage";
import AuditsPage from "./pages/AuditsPage";
import SignupPage from "./pages/SignupPage";
import RegisterAssetPage from "./pages/RegisterAssetPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                fontSize: "0.875rem",
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/assets" element={<Layout><AssetsPage /></Layout>} />
            <Route path="/assets/new" element={<Layout><RegisterAssetPage /></Layout>} />
            <Route path="/allocations" element={<Layout><AllocationsPage /></Layout>} />
            <Route path="/bookings" element={<Layout><BookingsPage /></Layout>} />
            <Route path="/maintenance" element={<Layout><MaintenancePage /></Layout>} />
            <Route path="/audits" element={<Layout><AuditsPage /></Layout>} />
            {/* Placeholder routes for org pages */}
            <Route path="/departments" element={<Layout><PlaceholderPage title="Departments" /></Layout>} />
            <Route path="/categories" element={<Layout><PlaceholderPage title="Categories" /></Layout>} />
            <Route path="/employees" element={<Layout><PlaceholderPage title="Employees" /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{title}</h1>
      <p style={{ color: "var(--text-secondary)" }}>This page is coming soon.</p>
    </div>
  );
}
