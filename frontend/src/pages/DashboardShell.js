import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Receipt, FileSpreadsheet, TrendingUp, Factory, Percent, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/app", end: true, icon: LayoutDashboard, label: "Overview", tid: "nav-overview" },
  { to: "/app/income-tax", icon: Receipt, label: "Income Tax", tid: "nav-income-tax" },
  { to: "/app/gst", icon: FileSpreadsheet, label: "GST Returns", tid: "nav-gst" },
  { to: "/app/investments", icon: TrendingUp, label: "Investments & AI", tid: "nav-investments" },
  { to: "/app/cost-audit", icon: Factory, label: "Cost Audit (CRA-3)", tid: "nav-cost-audit" },
  { to: "/app/tds", icon: Percent, label: "TDS / TCS Ledger", tid: "nav-tds" },
  { to: "/app/gst-audit", icon: ShieldAlert, label: "GST Audit Recon", tid: "nav-gst-audit" },
];

export default function DashboardShell() {
  const { user, doLogout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-100">
      <aside className="w-64 border-r border-zinc-800/70 flex flex-col shrink-0" data-testid="sidebar">
        <div className="p-5 flex items-center gap-2.5 border-b border-zinc-800/70">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="font-display text-sm text-white leading-tight">My Finance Book</div>
            <div className="text-[10px] text-zinc-500 font-mono-data">v2026 · FY 2026-27</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={n.tid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent"
                }`
              }
            >
              <n.icon className="w-4 h-4" strokeWidth={1.6} />
              <span className="font-display">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800/70">
          <div className="px-2 py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 flex items-center justify-center font-display font-bold text-white">
              {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{user?.name || "Demo User"}</div>
              <div className="text-[10px] text-zinc-500 truncate font-mono-data">{user?.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            data-testid="logout-btn"
            onClick={() => { doLogout(); nav("/"); }}
            className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/5 mt-1"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10 max-w-[1600px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
