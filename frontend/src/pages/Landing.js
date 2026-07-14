import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Sparkles, ShieldCheck, Zap, Layers, BrainCircuit, LineChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const VALUE_PROPS = [
  { icon: Layers, t: "All-in-one Compliance Suite", d: "Income Tax, GST, TDS/TCS, Cost Audit (CRA-3), MCA XBRL — one login." },
  { icon: Zap, t: "Instant Multi-Ledger Reconciliation", d: "3-way cross-check between Books, GSTR-1/3B/2B and CRA cost records." },
  { icon: BrainCircuit, t: "Predictive AI Anomaly Diagnostics", d: "Powered by Claude 4.5 & GPT-5.2 — flag risks before the notice arrives." },
  { icon: LineChart, t: "Portfolio Intelligence — INR & USD", d: "Indian & US equities, F&O, Mutual Funds, PPF/NPS/SGB tracked live." },
];

function Cinematic({ onSkip, onEnded }) {
  useEffect(() => {
    const t = setTimeout(onEnded, 8000);
    return () => clearTimeout(t);
  }, [onEnded]);

  return (
    <motion.div
      key="cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-[#09090b] overflow-hidden"
      data-testid="cinematic-intro"
    >
      <div className="absolute inset-0 mfb-grid-bg" />
      <div className="mfb-orb mfb-orb-cyan mfb-orb-anim" style={{ width: 500, height: 500, top: "10%", left: "-10%" }} />
      <div className="mfb-orb mfb-orb-blue mfb-orb-anim" style={{ width: 620, height: 620, bottom: "-15%", right: "-10%", animationDelay: "3s" }} />
      <div className="mfb-orb mfb-orb-violet mfb-orb-anim" style={{ width: 380, height: 380, top: "40%", left: "45%", animationDelay: "5s" }} />

      <button
        onClick={onSkip}
        data-testid="skip-intro-btn"
        className="absolute top-6 right-6 z-20 px-5 py-2.5 rounded-full border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center gap-2 font-display text-sm"
      >
        Skip Intro & Login <ArrowRight className="w-4 h-4" />
      </button>

      <div className="relative z-10 h-full flex flex-col items-start justify-center max-w-6xl mx-auto px-8">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.7 }} className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mfb-glow-cyan">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <span className="font-display text-cyan-300 tracking-widest text-xs uppercase">My Finance Book · v2026</span>
        </motion.div>

        <motion.h1 initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.05] tracking-tight">
          One book to run <span className="text-cyan-300">every</span><br />
          statutory obligation you have.
        </motion.h1>

        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-6 text-zinc-400 text-lg max-w-2xl leading-relaxed">
          Automated Income Tax filing · GST Multi-way Reconciliation · Indian & US portfolios ·
          Section 148 Cost Audit + MCA XBRL · Live TDS/TCS tracking under the 2026 mandate.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.7 }} className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {VALUE_PROPS.map((v, i) => (
            <motion.div key={v.t} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 + i * 0.15 }} className="mfb-glass rounded-xl p-5 hover:border-cyan-500/40 transition-colors duration-300">
              <v.icon className="w-5 h-5 text-cyan-300 mb-3" />
              <div className="font-display text-sm text-white">{v.t}</div>
              <div className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{v.d}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-10 flex items-center gap-6 text-xs text-zinc-500 font-mono-data">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />COMPETITORS: manual files, isolated tools, delayed spreadsheets</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-300 mfb-pulse" />US: real-time cross-recon, statutory limits, predictive AI</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function LoginPanel() {
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
      setSession(r.token, r.user);
      toast.success(`Welcome, ${r.user.name || r.user.email}`);
      nav("/app");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Login failed");
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
          <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">Login with a pre-approved credential. All internal pages are gated behind JWT + email allowlist — RE One style.</p>
          <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500 font-mono-data">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> bcrypt + JWT · SEBI/MCA aligned
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

export default function Landing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stage, setStage] = useState("intro"); // intro | login

  useEffect(() => {
    if (user) nav("/app");
  }, [user, nav]);

  return (
    <div className="min-h-screen bg-[#09090b]">
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <Cinematic onSkip={() => setStage("login")} onEnded={() => setStage("login")} />
        ) : (
          <LoginPanel />
        )}
      </AnimatePresence>
    </div>
  );
}
