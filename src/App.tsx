import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  Rocket,
  Sparkles,
  Gauge,
  Cpu,
  Database,
  Network,
  GraduationCap,
  CalendarClock,
  ShieldCheck,
  ChevronRight,
  Info,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

const COLORS = {
  bg: "#0B1020",
  mars: "#D9484A",
  marsAlt: "#F97362",
  indigo: "#312E81",
  amber: "#F59E0B",
};

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ring-1 transition ${checked ? "bg-rose-500/30 ring-rose-300 text-white" : "bg-white/5 ring-white/10 text-slate-300 hover:bg-white/10"}`}
  >
    <span className={`h-3 w-3 rounded-full ${checked ? "bg-rose-400" : "bg-slate-500"}`} />
    {label}
  </button>
);

const Chip = ({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`rounded-xl px-3 py-1.5 text-xs ring-1 transition ${active ? "bg-indigo-500/30 ring-indigo-400 text-white" : "bg-black/30 ring-white/10 text-slate-300 hover:bg-white/5"}`}
  >
    {children}
  </button>
);

const Section = ({ id, label, subtitle, children }: { id?: string; label: string; subtitle?: string; children: React.ReactNode }) => (
  <section id={id} className="relative py-16 sm:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 ring-1 ring-rose-500/40 px-3 py-1 text-rose-200 text-xs tracking-wide">
          <Sparkles size={14} className="opacity-80" /> {label}
        </div>
        {subtitle && (
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold text-white">
            {subtitle}
          </h2>
        )}
      </motion.div>
      {children}
    </div>
  </section>
);

const Background = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ container: ref.current ?? undefined });
  const yMars = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yCloud = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(1px 1px at 10% 20%,#ffffff33 1px,transparent 1px), radial-gradient(1px 1px at 80% 30%,#ffffff22 1px,transparent 1px), radial-gradient(1px 1px at 40% 70%,#ffffff22 1px,transparent 1px)`, backgroundSize: "1200px 800px" }} />
      <motion.div style={{ y: yMars }} className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full" >
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={COLORS.marsAlt} />
              <stop offset="100%" stopColor={COLORS.mars} />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="200" fill="url(#g)" />
          <motion.ellipse cx="180" cy="190" rx="160" ry="30" fill="#ffffff14" animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
          <motion.ellipse cx="220" cy="230" rx="120" ry="22" fill="#ffffff10" animate={{ x: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 7 }} />
        </svg>
      </motion.div>
      <motion.div style={{ y: yCloud }} className="absolute bottom-10 left-10 h-72 w-72 bg-amber-400/10 blur-3xl rounded-full" />
    </div>
  );
};

function useCurve(model: "exp" | "logistic", k: number, tMax: number, noise = 0) {
  return useMemo(() => {
    const pts: { t: number; y: number; yLo: number; yHi: number }[] = [];
    const step = Math.max(1, Math.floor(tMax / 60));
    for (let t = 0; t <= tMax; t += step) {
      let ideal = 1;
      if (model === "exp") ideal = Math.exp(-k * t);
      else {
        const L = 1, x0 = tMax * 0.25, s = Math.max(1e-3, 10 * k);
        ideal = 1 - (L / (1 + Math.exp(-s * (t - x0))));
      }
      const eps = noise ? (Math.random() - 0.5) * 2 * noise * ideal : 0;
      const y = Math.max(0, Math.min(1, ideal + eps));
      pts.push({ t, y, yLo: Math.max(0, y * 0.9), yHi: Math.min(1, y * 1.1) });
    }
    return pts;
  }, [model, k, tMax, noise]);
}

const WeightLossProjection = () => {
  const [k, setK] = useState(0.03);
  const [noise, setNoise] = useState(0.02);
  const [model, setModel] = useState<"exp" | "logistic">("exp");
  const t90 = useMemo(() => Math.log(10) / Math.max(1e-6, k), [k]);
  const tMax = Math.ceil(t90 * 1.2);
  const data = useCurve(model, k, tMax, noise);

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Weight Loss Projection</h3>
            <div className="flex gap-2" role="tablist" aria-label="Model">
              <Chip active={model === "exp"} onClick={() => setModel("exp")}>Exponential</Chip>
              <Chip active={model === "logistic"} onClick={() => setModel("logistic")}>Logistic</Chip>
            </div>
          </div>
          <p className="mt-2 text-slate-300 text-sm">
            Switch between models and tweak parameters. Click the line to pin a point and read values.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-200 text-sm">Decay rate (k)</label>
              <input type="range" min={0.005} max={0.1} step={0.001} value={k} onChange={(e) => setK(parseFloat(e.target.value))} className="w-full accent-rose-500" />
              <div className="flex justify-between text-xs text-slate-400"><span>0.005</span><span>{k.toFixed(3)}</span><span>0.100</span></div>
            </div>
            <div>
              <label className="text-slate-200 text-sm">Noise</label>
              <input type="range" min={0} max={0.1} step={0.005} value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full accent-amber-500" />
              <div className="flex justify-between text-xs text-slate-400"><span>0</span><span>{noise.toFixed(3)}</span><span>0.100</span></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-slate-400">T(EOL @ 90%)</div>
              <div className="text-2xl font-semibold text-rose-300">{t90.toFixed(1)}<span className="text-slate-400 text-sm ml-1">units</span></div>
            </div>
            <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
              <div className="text-slate-400">Model</div>
              <div className="text-2xl font-semibold text-indigo-300">{model}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6">
        <InteractiveArea data={data} />
        <div className="mt-4 text-xs text-slate-400">Demo: synthetic data with uncertainty bands; click to inspect a point.</div>
      </div>
    </div>
  );
};

const InteractiveArea = ({ data }: { data: { t: number; y: number; yLo: number; yHi: number }[] }) => {
  const [pin, setPin] = useState<{ t: number; y: number } | null>(null);
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} onClick={(e: any) => { if (e && e.activeLabel != null && e.activePayload) setPin({ t: e.activeLabel, y: e.activePayload[2]?.value ?? e.activePayload[0]?.value }); }} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF12" />
          <XAxis dataKey="t" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} domain={[0, 1]} />
          <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid #ffffff20", borderRadius: 12, color: "white" }} />
          <Area type="monotone" dataKey="yHi" stroke="none" fill="url(#pi)" />
          <Area type="monotone" dataKey="yLo" stroke="none" fill="url(#pi)" />
          <Line type="monotone" dataKey="y" stroke="#ef4444" dot={false} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <AnimatePresence>
        {pin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-3 text-xs rounded-xl bg-black/40 ring-1 ring-white/10 p-3 inline-flex items-center gap-2">
            <Info size={14} className="text-amber-300" /> Pinned: <span className="text-white">t={pin.t}</span>, y={<span className="text-rose-300">{pin.y.toFixed(3)}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SAMPLE_FEATURES: Record<string, Record<string, number>> = {
  "Day 1": { Freshness: 0.24, Sillage: 0.18, Longevity: 0.12, Price: 0.06, Brand: 0.05, "Eco Score": 0.08, Package: 0.10, Texture: 0.17 },
  "Day 7": { Freshness: 0.18, Sillage: 0.22, Longevity: 0.16, Price: 0.05, Brand: 0.04, "Eco Score": 0.09, Package: 0.08, Texture: 0.18 },
  "Day 14": { Freshness: 0.15, Sillage: 0.25, Longevity: 0.19, Price: 0.04, Brand: 0.03, "Eco Score": 0.10, Package: 0.07, Texture: 0.17 },
};

const DriversOfLiking = () => {
  const [tp, setTp] = useState<keyof typeof SAMPLE_FEATURES>("Day 1");
  const [noise, setNoise] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const features = useMemo(() => {
    const base = SAMPLE_FEATURES[tp];
    return Object.entries(base).map(([k, v]) => ({ name: k, value: Math.max(0, v + (Math.random() - 0.5) * 2 * noise) }));
  }, [tp, noise]);

  const stability = useMemo(() => {
    const ref = Object.entries(SAMPLE_FEATURES["Day 1"]).sort((a, b) => b[1] - a[1]).map(([n]) => n);
    const order = [...features].sort((a, b) => b.value - a.value).map((f) => f.name);
    let matches = 0;
    for (let i = 0; i < order.length; i++) if (order[i] === ref[i]) matches++;
    return (matches / order.length) * 0.3 + 0.7 - noise * 0.5;
  }, [features, noise]);

  const sorted = useMemo(() => [...features].sort((a, b) => b.value - a.value), [features]);

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6">
          <h3 className="text-xl font-semibold text-white">Drivers of Liking</h3>
          <p className="mt-2 text-slate-300 text-sm">Click a bar to open details & recommendations. Toggle noise to simulate sampling variance.</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {(["Day 1", "Day 7", "Day 14"] as const).map((d) => (
              <Chip key={d} active={tp === d} onClick={() => setTp(d)}>{d}</Chip>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-slate-200 text-sm">Noise</label>
            <input type="range" min={0} max={0.08} step={0.005} value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            <div className="flex justify-between text-xs text-slate-400"><span>0</span><span>{noise.toFixed(3)}</span><span>0.080</span></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10"><div className="text-slate-400">Stability (τ)</div><div className="text-2xl font-semibold text-indigo-300">{Math.max(0.5, Math.min(1, stability)).toFixed(2)}</div></div>
            <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10"><div className="text-slate-400">Top driver</div><div className="text-2xl font-semibold text-emerald-300">{sorted[0]?.name}</div></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-3 rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF12" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
              <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid #ffffff20", borderRadius: 12, color: "white" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} onClick={(_, idx) => setSelected(sorted[idx].name)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <DriverModal name={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
};

const DriverModal = ({ name, onClose }: { name: string | null; onClose: () => void }) => (
  <AnimatePresence>
    {name && (
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="relative m-4 w-full max-w-lg rounded-2xl bg-slate-900 ring-1 ring-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Driver detail — {name}</div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="mt-3 text-sm text-slate-300">
            Suggested actions for <span className="text-white font-medium">{name}</span>:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Run A/B on variant with +10% emphasis.</li>
              <li>Collect qualitative feedback in next panel.</li>
              <li>Monitor drift weekly and SHAP stability.</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CapabilityRow = ({ name, classic, fabric }: { name: string; classic: boolean; fabric: boolean }) => (
  <div className="grid grid-cols-3 items-center py-2 px-3 rounded-xl hover:bg-white/5 transition">
    <div className="text-slate-200 text-sm">{name}</div>
    <div className="text-center text-xs">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ring-1 ${classic ? "bg-rose-500/15 ring-rose-400/30 text-rose-200" : "bg-slate-800 ring-white/10 text-slate-400"}`}>{classic ? "Yes" : "—"}</span>
    </div>
    <div className="text-center text-xs">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ring-1 ${fabric ? "bg-indigo-500/20 ring-indigo-400/30 text-indigo-200" : "bg-slate-800 ring-white/10 text-slate-400"}`}>{fabric ? "Yes" : "—"}</span>
    </div>
  </div>
);

const AzureComparison = () => {
  const [showFabric, setShowFabric] = useState(true);
  const rows = [
    { name: "OneLake (unified storage)", classic: false, fabric: true },
    { name: "Delta / Lakehouse", classic: true, fabric: true },
    { name: "Pipelines / ADF", classic: true, fabric: true },
    { name: "AutoML / MLflow", classic: true, fabric: true },
    { name: "Real‑Time Intelligence (KQL)", classic: false, fabric: true },
    { name: "Embedded Analytics (PBI)", classic: true, fabric: true },
    { name: "Shortcuts (no-copy links)", classic: false, fabric: true },
    { name: "MLOps registry", classic: true, fabric: true },
  ];
  return (
    <div className="rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">Azure Classic vs Microsoft Fabric</div>
        <Toggle checked={showFabric} onChange={setShowFabric} label="Show Fabric" />
      </div>
      <div className="grid grid-cols-3 text-xs text-slate-400 uppercase tracking-wider pb-2 mb-2 border-b border-white/10">
        <div>Capability</div>
        <div className="text-center">Azure Classic</div>
        <div className="text-center">Microsoft Fabric</div>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <CapabilityRow key={r.name} name={r.name} classic={r.classic} fabric={showFabric ? r.fabric : false} />
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-400">Toggle lets you simulate a staged rollout toward Fabric capabilities.</div>
    </div>
  );
};

const MILESTONES = [
  { title: "Kick‑off & Discovery", weeks: 2, desc: "Stakeholders, scope, success criteria, tenant prep" },
  { title: "Data Engineering", weeks: 5, desc: "Ingest, Lakehouse model, bronze→silver→gold" },
  { title: "Orchestration & QA", weeks: 3, desc: "Pipelines, tests, parity harness, monitoring" },
  { title: "Weight Loss App", weeks: 3, desc: "Feature complete + usability pass" },
  { title: "DOL App", weeks: 3, desc: "Explainability, SHAP stability ≥0.7" },
  { title: "Governance & Handover", weeks: 2, desc: "Docs, runbooks, enablement" },
];

const Timeline = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MILESTONES.map((m, i) => (
        <motion.button key={m.title} onClick={() => setOpenIdx(openIdx === i ? null : i)} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="text-left rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-5 focus:outline-none focus:ring-2 focus:ring-rose-400">
          <div className="flex items-center gap-3 text-white">
            <CalendarClock className="text-rose-300" />
            <div>
              <div className="font-semibold">{m.title}</div>
              <div className="text-xs text-slate-400">{m.weeks} weeks</div>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {openIdx === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 text-xs text-slate-300">
                {m.desc}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
};

export default function App() {
  const [pauseAnim, setPauseAnim] = useState(false);
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200 relative">
      <Background />

      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0B1020]/70 bg-[#0B1020]/80 ring-1 ring-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="text-rose-400" />
            <span className="font-semibold text-white">Clouds on Mars</span>
            <span className="text-slate-400 hidden sm:inline">· R&D Advanced Analytics</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#apps" className="hover:text-white/90">Apps</a>
            <a href="#platform" className="hover:text-white/90">Platform</a>
            <a href="#timeline" className="hover:text-white/90">Timeline</a>
          </nav>
          <button onClick={() => setPauseAnim((p) => !p)} className="ml-4 inline-flex items-center gap-2 text-xs rounded-full px-3 py-1.5 bg-white/5 ring-1 ring-white/10 hover:bg-white/10">
            {pauseAnim ? <PlayCircle size={14} /> : <PauseCircle size={14} />} Background {pauseAnim ? "play" : "pause"}
          </button>
          <style>{pauseAnim ? "svg * { animation-play-state: paused !important }" : ""}</style>
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl sm:text-6xl font-semibold text-white tracking-tight">Launch your data into a new orbit</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }} className="mt-4 text-lg text-slate-300 max-w-3xl">From migration to AI‑ready apps: Weight Loss Projection and Drivers of Liking—rebuilt for Azure & Fabric with governance, parity, and scale.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#apps" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-lg shadow-rose-900/30 transition">
              Explore interactive demos
            </a>
            <a href="#platform" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium ring-1 ring-white/20 transition">
              See the platform
            </a>
          </motion.div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[{ label: "Solutions delivered", value: "600+" }, { label: "Data & AI experts", value: "100+" }, { label: "Global customers", value: "50+" }].map((s) => (
              <div key={s.label} className="rounded-2xl bg-black/30 ring-1 ring-white/10 p-5">
                <div className="text-3xl font-semibold text-white">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section id="apps" label="Interactive" subtitle="Apps, extended beyond the deck">
        <div className="grid lg:grid-cols-2 gap-10">
          <WeightLossProjection />
          <DriversOfLiking />
        </div>
      </Section>

      <Section id="platform" label="Architecture" subtitle="Azure today, Fabric tomorrow—your data, one platform">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          <div className="rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6 space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Database className="text-rose-300" />
              <div>
                <div className="font-semibold">Azure Classic</div>
                <div className="text-xs text-slate-400">ADF · Databricks · MLflow · App Service · API Mgmt</div>
              </div>
            </div>
            <AzureComparison />
          </div>
          <div className="rounded-2xl bg-slate-900/70 ring-1 ring-white/10 p-6 space-y-5">
            <div className="flex items-center gap-3 text-white">
              <Network className="text-indigo-300" />
              <div>
                <div className="font-semibold">Microsoft Fabric</div>
                <div className="text-xs text-slate-400">OneLake · Lakehouse · Data Pipelines · RTI · PBI</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <ShieldCheck className="text-emerald-300" />, t: "Unified governance" },
                { icon: <Cpu className="text-rose-300" />, t: "Built‑in Spark & ML" },
                { icon: <Gauge className="text-amber-300" />, t: "Performance at scale" },
                { icon: <GraduationCap className="text-indigo-300" />, t: "Self‑service + pro‑dev" },
              ].map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl bg-black/30 ring-1 ring-white/10 p-4 flex items-center gap-3">
                  {b.icon}
                  <div className="text-sm text-slate-200">{b.t}</div>
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-slate-400">We meet you where you are—migrate apps, validate outputs, and enable BI & AI with a secure foundation.</div>
          </div>
        </div>
      </Section>

      <Section id="timeline" label="Delivery" subtitle="A pragmatic, milestone‑driven plan">
        <Timeline />
      </Section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-rose-500/20 via-indigo-600/10 to-black p-[1px]">
          <div className="rounded-3xl bg-[#0B1020]/80 p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h3 className="text-2xl md:text-3xl font-semibold text-white">Ready for a sandbox or pilot?</h3>
                <p className="mt-2 text-slate-300 max-w-2xl">
                  We can spin up a secure, Entra‑integrated demo in your tenant, validate parity with your legacy outputs, and hand you a roadmap to production.
                </p>
              </div>
              <div className="flex justify-start md:justify-end">
                <a href="https://cloudsonmars.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-lg shadow-rose-900/30 transition">
                  Open website <ChevronRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Clouds on Mars · Advanced Analytics</div>
          <div className="flex gap-4">
            <a href="#apps" className="hover:text-white/80">Apps</a>
            <a href="#platform" className="hover:text-white/80">Platform</a>
            <a href="#timeline" className="hover:text-white/80">Timeline</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
