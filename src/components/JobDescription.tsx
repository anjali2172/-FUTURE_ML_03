import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  Laptop, 
  Database, 
  Cloud, 
  Layout, 
  CheckCircle, 
  Terminal,
  Settings,
  Flame,
  Award
} from 'lucide-react';

interface JobDescriptionProps {
  roles: JobRole[];
  activeRole: JobRole;
  onSelectRole: (role: JobRole) => void;
  onUpdateRoleText: (roleId: string, newText: string) => void;
}

export default function JobDescription({ 
  roles, 
  activeRole, 
  onSelectRole, 
  onUpdateRoleText 
}: JobDescriptionProps) {
  const [editingText, setEditingText] = useState(activeRole.description);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleClick = (role: JobRole) => {
    onSelectRole(role);
    setEditingText(role.description);
    setSuccessMsg(`Switched active hiring profile to: "${role.title}"`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSaveText = () => {
    onUpdateRoleText(activeRole.id, editingText);
    setSuccessMsg("Linguistic parser successfully matched the revised specs and mapped real-time parameters!");
    setTimeout(() => setSuccessMsg(""), 4050);
  };

  // Helper to pick category icon styling
  const getRoleIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('python') || t.includes('machine')) return <Terminal className="w-5 h-5 text-emerald-400" />;
    if (t.includes('sde') || t.includes('frontend') || t.includes('react')) return <Layout className="w-5 h-5 text-cyan-400" />;
    if (t.includes('analyst') || t.includes('data')) return <Database className="w-5 h-5 text-teal-400" />;
    if (t.includes('security') || t.includes('cyber')) return <ShieldCheck className="w-5 h-5 text-rose-400" />;
    if (t.includes('devops') || t.includes('cloud')) return <Cloud className="w-5 h-5 text-purple-400" />;
    return <Laptop className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-6" id="job-description-tab-layout">
      {/* SECTION BANNER */}
      <div>
        <h1 className="text-2xl font-semibold font-display text-white tracking-tight">Active Job Categories</h1>
        <p className="text-xs text-slate-400 mt-1">
          Select or customize specific domains to run TF-IDF scanning vectors against.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* JOB ROLES SELECTION MATRIX */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
        Select Hiring Role Categories:
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => {
          const isActive = role.id === activeRole.id;
          return (
            <button
              key={role.id}
              onClick={() => handleRoleClick(role)}
              className={`text-left p-5 rounded-2xl border transition duration-150 relative overflow-hidden flex flex-col justify-between min-h-[195px] h-full group ${
                isActive 
                  ? 'bg-gradient-to-br from-[#1b274c] to-[#121c38] border-teal-500/70 shadow-lg shadow-teal-500/10' 
                  : 'bg-[#161F38] border-[#232F52] hover:border-slate-600'
              }`}
            >
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {getRoleIcon(role.title)}
                  </div>
                  {isActive && (
                    <span className="text-[9px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="font-display font-semibold text-white text-sm tracking-tight leading-tight group-hover:text-teal-300 transition">
                  {role.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {/* Skills preview bar */}
              <div className="mt-3 flex gap-1 overflow-hidden relative z-10">
                {role.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="bg-slate-900/60 border border-slate-800 text-slate-350 text-[9px] px-1.5 py-0.5 rounded font-mono">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Highlight vector outline for active roles */}
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-bl-full blur-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* DETAILED SPECIFICATION EDITOR */}
      <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-display font-semibold text-white text-sm">Specification Dictionary Editor</h3>
              <p className="text-[10px] text-slate-400">Modifying text updates mathematical cosine targets immediately.</p>
            </div>
          </div>
          <span className="text-xs bg-[#1F2B4E] text-slate-300 font-bold px-3 py-1 rounded-lg">
            {activeRole.title}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Customize Sourcing Keywords & Standards:</label>
          <textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            rows={8}
            className="w-full bg-slate-950/80 border border-[#232F52] focus:border-teal-400 text-slate-200 p-4 rounded-xl text-xs font-mono leading-relaxed outline-none focus:ring-1 focus:ring-teal-400"
          placeholder="Specify required tech-stack, degrees, and keywords..."
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-wrap gap-1.5 max-w-lg">
            {activeRole.skills.map(s => (
              <span key={s} className="bg-[#1f2c4e] text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-mono capitalize">
                ✓ {s}
              </span>
            ))}
          </div>
          
          <button
            onClick={handleSaveText}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-semibold px-4 py-2.5 rounded-xl text-xs transition duration-150 flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-500/10"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
