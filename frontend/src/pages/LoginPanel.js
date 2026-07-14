import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPanel() {
  const { setSession } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@myfinancebook.in");
  const [password, setPassword] = useState("Demo@123");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await login(email, password, remember);
      // With httpOnly cookies the server has set the session; token in response is only
      // kept for backwards-compatible non-browser callers. Frontend never persists it.
      setSession(null, r.user);
      toast.success(`Welcome, ${r.user.name || r.user.email}`);
      nav("/app");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#09090b] relative overflow-hidden flex"
      data-testid="login-stage"
    >
      <div className="absolute inset-0 mfb-grid-bg opacity-60" />
      <div className="mfb-orb mfb-orb-cyan" style={{ width: 500, height: 500, top: "-10%", left: "-10%", opacity: 0.25 }} />
      <div className="mfb-orb mfb-orb-blue" style={{ width: 600, height: 600, bottom: "-20%", right: "-15%", opacity: 0.2 }} />

      <div className="relative z-10 hidden lg:flex flex-col justify-between p-14 w-1/2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <span className="font-display text-white text-lg tracking-tight">My Finance Book</span>
        </div>
        <div>
          <div className="font-display text-5xl text-white leading-tight tracking-tight">
            Every ledger. <br /><span className="text-cyan-300">One vault.</span>
          </div>
          <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">Login with a pre-approved credential. Session is stored in a secure, httpOnly cookie — never in browser storage.</p>
          <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500 font-mono-data">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> bcrypt · JWT · httpOnly cookie
          </div>
        </div>
        <div className="text-xs text-zinc-600 font-mono-data">© 2026 My Finance Book · Built for Indian CAs & CFOs</div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="mfb-glass rounded-2xl p-8 sm:p-10 w-full max-w-md mfb-glow-cyan">
          <div className="mb-8">
            <div className="text-xs font-mono-data text-cyan-300 uppercase tracking-widest">Secure Access</div>
            <h2 className="font-display text-3xl text-white mt-2 tracking-tight">Unlock Dashboard</h2>
            <p className="text-sm text-zinc-500 mt-2">Enter your registered credentials to continue.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-xs text-zinc-400 font-mono-data uppercase tracking-wider">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  data-testid="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-zinc-900/60 border-zinc-800 text-white h-11 focus-visible:ring-cyan-500"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pw" className="text-xs text-zinc-400 font-mono-data uppercase tracking-wider">Security Password</Label>
                <button type="button" data-testid="forgot-btn" className="text-xs text-cyan-300 hover:text-cyan-200" onClick={() => toast.info("Password reset link would be sent to your admin.")}>Forgot Password?</button>
              </div>
              <div className="relative mt-2">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="pw"
                  type={show ? "text" : "password"}
                  data-testid="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-900/60 border-zinc-800 text-white h-11 focus-visible:ring-cyan-500"
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch data-testid="remember-toggle" checked={remember} onCheckedChange={setRemember} />
                <span className="text-xs text-zinc-400">Remember me for 7 days</span>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              disabled={busy}
              className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-display font-semibold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all"
            >
              {busy ? "Verifying…" : "Unlock Dashboard →"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800/70 text-[11px] text-zinc-500 font-mono-data leading-relaxed">
            <div className="text-zinc-400 mb-1">Pre-approved demo accounts:</div>
            demo@myfinancebook.in / Demo@123<br />
            ca@myfinancebook.in / CA@123456
          </div>
        </div>
      </div>
    </motion.div>
  );
}
