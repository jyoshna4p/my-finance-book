import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import DashboardShell from "@/pages/DashboardShell";
import IncomeTax from "@/pages/IncomeTax";
import GST from "@/pages/GST";
import Investments from "@/pages/Investments";
import CostAudit from "@/pages/CostAudit";
import TDS from "@/pages/TDS";
import GSTAudit from "@/pages/GSTAudit";
import Overview from "@/pages/Overview";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-500 font-display">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/app"
            element={
              <Protected>
                <DashboardShell />
              </Protected>
            }
          >
            <Route index element={<Overview />} />
            <Route path="income-tax" element={<IncomeTax />} />
            <Route path="gst" element={<GST />} />
            <Route path="investments" element={<Investments />} />
            <Route path="cost-audit" element={<CostAudit />} />
            <Route path="tds" element={<TDS />} />
            <Route path="gst-audit" element={<GSTAudit />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
