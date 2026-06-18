import React, { useState } from 'react';
import { 
  Sliders, 
  GraduationCap, 
  CheckCircle
} from 'lucide-react';

interface AdminPanelProps {
  onNotify: (msg: string) => void;
}

export default function AdminPanel({ onNotify }: AdminPanelProps) {
  const [minRecommended, setMinRecommended] = useState<number>(65);
  const [minShortlisted, setMinShortlisted] = useState<number>(45);
  const [tier1Boost, setTier1Boost] = useState<boolean>(true);
  const [cgpaMultiplier, setCgpaMultiplier] = useState<number>(1.1);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onNotify("Updated candidate ranking weights and eligibility guidelines successfully!");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6" id="admin-panel-layout">
      {/* SECTION HEADER */}
      <div>
        <h1 className="text-2xl font-semibold font-display text-white tracking-tight">System Controls & Parameters</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune the algorithmic TF-IDF multipliers, set ATS recommendation layers, and audit API integrations.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Vetting weights updated! Recalibrating matching matrices now.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECOMMENDED SLIDERS CARD */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-teal-400" />
            ATS Match Classification Levels
          </h3>

          <div className="space-y-4">
            {/* Highly Recommended slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>"Highly Recommended" Threshold Limit</span>
                <span className="font-mono font-bold text-teal-400">{minRecommended}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={minRecommended}
                onChange={(e) => setMinRecommended(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-450">Applicants with match scores equal or exceeding this value obtain premium recommendations.</p>
            </div>

            {/* Shortlisted slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>"Shortlisted" Threshold Limit</span>
                <span className="font-mono font-bold text-cyan-400">{minShortlisted}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="55"
                value={minShortlisted}
                onChange={(e) => setMinShortlisted(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-450">Applicants meeting this category score are flagged as shortlisted.</p>
            </div>
          </div>
        </div>

        {/* ALGORITHMIC BOOSTS */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            Indian-Markets Credential Boost Indices
          </h3>

          <div className="space-y-4">
            {/* Tier-1 boost toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-900">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">Tier-1 Institution Boost Index</span>
                <span className="text-[10px] text-slate-400">Apply a +10% weight modifier for graduates from IITs, NITs, and BITS Pilani.</span>
              </div>
              <input
                type="checkbox"
                checked={tier1Boost}
                onChange={(e) => setTier1Boost(e.target.checked)}
                className="rounded border-[#2F447F] text-teal-500 focus:ring-teal-400 bg-slate-950 h-4.5 w-4.5 cursor-pointer"
              />
            </div>

            {/* CGPA Score index */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Indian CGPA Scoring Weight Multiplier</span>
                <span className="font-mono font-bold text-amber-400">{cgpaMultiplier}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.5"
                step="0.05"
                value={cgpaMultiplier}
                onChange={(e) => setCgpaMultiplier(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-450 font-medium">Amplifies candidates with exceptional CGPA / college score entries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE CONTROLS BLOCK */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-display font-bold px-6 py-3 rounded-xl text-xs shadow-lg shadow-teal-500/10 transition"
        >
          Save System Regulations
        </button>
      </div>
    </div>
  );
}
