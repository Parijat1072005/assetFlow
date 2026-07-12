
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
import DepartmentsPage from "./pages/DepartmentsPage";
import CategoriesPage from "./pages/CategoriesPage";
import EmployeesPage from "./pages/EmployeesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReturnTransferPage from "./pages/ReturnTransferPage";
import BookingFormPage from "./pages/BookingFormPage";
import MaintenanceFormPage from "./pages/MaintenanceFormPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import AuditDetailPage from "./pages/AuditDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AllocateAssetPage from "./pages/AllocateAssetPage";

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
            <Route path="/assets/:id" element={<Layout><AssetDetailPage /></Layout>} />
            <Route path="/allocations" element={<Layout><AllocationsPage /></Layout>} />
            <Route path="/allocations/new" element={<Layout><AllocateAssetPage /></Layout>} />
            <Route path="/allocations/return" element={<Layout><ReturnTransferPage /></Layout>} />
            <Route path="/bookings" element={<Layout><BookingsPage /></Layout>} />
            <Route path="/bookings/new" element={<Layout><BookingFormPage /></Layout>} />
            <Route path="/maintenance" element={<Layout><MaintenancePage /></Layout>} />
            <Route path="/maintenance/new" element={<Layout><MaintenanceFormPage /></Layout>} />
            <Route path="/audits" element={<Layout><AuditsPage /></Layout>} />
            <Route path="/audits/:id" element={<Layout><AuditDetailPage /></Layout>} />
            <Route path="/departments" element={<Layout><DepartmentsPage /></Layout>} />
            <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
            <Route path="/employees" element={<Layout><EmployeesPage /></Layout>} />
            <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

