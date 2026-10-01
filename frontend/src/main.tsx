import React from "react";
import ReactDOM from "react-dom/client";
import type { Root } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import PublicLayout from "@/app/(public)/layout";
import DashboardLayout from "@/app/(dashboard)/layout";
import LandingPage from "@/app/(public)/page";
import AboutPage from "@/app/(public)/about/page";
import ContactPage from "@/app/(public)/contact/page";
import HowItWorksPage from "@/app/(public)/how-it-works/page";
import LoginPage from "@/app/(public)/login/page";
import RegisterPage from "@/app/(public)/register/page";
import ResearchPage from "@/app/(public)/research/page";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import NewAnalysisPage from "@/app/(dashboard)/analysis/new/page";
import AnalysisWorkspacePage from "@/app/(dashboard)/analysis/[id]/page";
import ResultsPage from "@/app/(dashboard)/results/[id]/page";
import PatientsPage from "@/app/(dashboard)/patients/page";
import PatientProfilePage from "@/app/(dashboard)/patients/[id]/page";
import TimelinePage from "@/app/(dashboard)/patients/[id]/timeline/page";
import ModelsPage from "@/app/(dashboard)/models/page";
import ValidationPage from "@/app/(dashboard)/validation/page";
import ExplainabilityPage from "@/app/(dashboard)/explainability/page";
import ResearchLabPage from "@/app/(dashboard)/research-lab/page";
import ReportsPage from "@/app/(dashboard)/reports/page";
import SettingsPage from "@/app/(dashboard)/settings/page";
import GeographicMapPage from "@/app/(dashboard)/map/page";
import WellnessPage from "@/app/(dashboard)/wellness/page";
import { ErrorBoundary } from "@/src/ErrorBoundary";
import { AdminLayout } from "@/src/admin/AdminLayout";
import { AdminAccessRequests, AdminDashboard, AdminSpecialPage, AdminTablePage } from "@/src/admin/AdminPages";
import { AdminAuditLogsPage, AdminReportsPage } from "@/src/admin/AdminRecords";
import { AdminLogin } from "@/src/admin/AdminLogin";

function DynamicAnalysis() { const { id = "demo" } = useParams(); return <AnalysisWorkspacePage params={{ id }} />; }
function DynamicResults() { const { id = "demo" } = useParams(); return <ResultsPage params={{ id }} />; }
function DynamicPatient() { const { id = "P-1001" } = useParams(); return <PatientProfilePage params={{ id }} />; }
function DynamicTimeline() { const { id = "P-1001" } = useParams(); return <TimelinePage params={{ id }} />; }

function withPublic(page: React.ReactNode) { return <PublicLayout>{page}</PublicLayout>; }
function withDashboard(page: React.ReactNode) { return <DashboardLayout>{page}</DashboardLayout>; }

function App() {
  return <Routes>
    <Route path="/" element={withPublic(<LandingPage />)} />
    <Route path="/about" element={withPublic(<AboutPage />)} />
    <Route path="/contact" element={withPublic(<ContactPage />)} />
    <Route path="/how-it-works" element={withPublic(<HowItWorksPage />)} />
    <Route path="/login" element={withPublic(<LoginPage />)} />
    <Route path="/register" element={withPublic(<RegisterPage />)} />
    <Route path="/research" element={withPublic(<ResearchPage />)} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="access-requests" element={<AdminAccessRequests />} />
      <Route path="users" element={<AdminTablePage page="users" title="User management" description="Manage user accounts, account state, and access records." />} />
      <Route path="doctors" element={<AdminTablePage page="doctors" title="Doctor management" description="Review verification state and manage professional access." />} />
      <Route path="patients" element={<AdminTablePage page="patients" title="Patient management" description="Privacy-aware access to registered patient metadata." />} />
      <Route path="analyses" element={<AdminTablePage page="analyses" title="MRI analysis management" description="Inspect analysis metadata, processing state, and model version." />} />
      <Route path="models" element={<AdminTablePage page="models" title="Model management center" description="Experimental model registry, lifecycle, and comparison data." />} />
      <Route path="datasets" element={<AdminTablePage page="datasets" title="Dataset management" description="Dataset versioning, sources, modalities, and lifecycle status." />} />
      <Route path="validation" element={<AdminSpecialPage type="validation" />} />
      <Route path="reports" element={<AdminReportsPage />} />
      <Route path="analytics" element={<AdminSpecialPage type="analytics" />} />
      <Route path="map" element={<GeographicMapPage admin />} />
      <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      <Route path="security" element={<AdminSpecialPage type="security" />} />
      <Route path="settings" element={<AdminSpecialPage type="settings" />} />
      <Route path="profile" element={<AdminSpecialPage type="profile" />} />
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>
    <Route path="/dashboard" element={withDashboard(<DashboardPage />)} />
    <Route path="/analysis/new" element={withDashboard(<NewAnalysisPage />)} />
    <Route path="/analysis/:id" element={withDashboard(<DynamicAnalysis />)} />
    <Route path="/results/:id" element={withDashboard(<DynamicResults />)} />
    <Route path="/patients" element={withDashboard(<PatientsPage />)} />
    <Route path="/patients/:id/timeline" element={withDashboard(<DynamicTimeline />)} />
    <Route path="/patients/:id" element={withDashboard(<DynamicPatient />)} />
    <Route path="/models" element={withDashboard(<ModelsPage />)} />
    <Route path="/validation" element={withDashboard(<ValidationPage />)} />
    <Route path="/explainability" element={withDashboard(<ExplainabilityPage />)} />
    <Route path="/research-lab" element={withDashboard(<ResearchLabPage />)} />
    <Route path="/reports" element={withDashboard(<ReportsPage />)} />
    <Route path="/settings" element={withDashboard(<SettingsPage />)} />
    <Route path="/map" element={withDashboard(<GeographicMapPage />)} />
    <Route path="/wellness" element={withDashboard(<WellnessPage />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

declare global {
  interface Window { __neuroScanRoot?: Root }
}

const container = document.getElementById("root");
if (!container) throw new Error("Application root element was not found.");
const root = window.__neuroScanRoot ?? ReactDOM.createRoot(container);
window.__neuroScanRoot = root;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider><App /></AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
