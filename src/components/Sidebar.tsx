import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Award, 
  BarChart4, 
  Settings, 
  Compass, 
  Briefcase,
  Terminal,
  Cpu,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeRole: JobRole;
  customUploadedCount: number;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  activeRole,
  customUploadedCount
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Navigation tabs configuration matching user screenshot exactly
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'jd', label: 'Job Description', icon: <FileText className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload Resumes', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'rankings', label: 'Candidate Rankings', icon: <Award className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare Candidates', icon: <BarChart4 className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin Panel', icon: <Settings className="w-4 h-4" /> },
    { id: 'landing', label: 'Landing Page', icon: <Compass className="w-4 h-4" /> },
  ];

  return (
    <div 
      className="w-full lg:w-64 bg-[#0B1226] border-r border-[#1D2743] flex flex-col justify-between h-auto lg:h-screen text-slate-300 shrink-0 select-none transition-all duration-300"
      id="recruitment-sidebar"
    >
      <div className="flex flex-col">
        {/* LOGO CONTAINER with Hamburger Switch (3 lines) */}
        <div className="flex items-center justify-between px-6 py-4 lg:py-6 border-b border-[#161F3B]">
          <div className="flex items-center gap-3">
            <div className="bg-[#00D2C4] text-slate-950 font-display font-extrabold text-xs w-7 h-7 rounded-lg flex items-center justify-center shadow-lg shadow-[#00D2C4]/20 shrink-0">
              AI
            </div>
            <span className="font-display font-extrabold text-white text-sm tracking-widest uppercase">
              Resume Ranker
            </span>
          </div>

          {/* Collapsible Mobile 3-lines menu switch */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-[#00D2C4] hover:bg-[#1a264a] rounded-xl transition"
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className={`px-3 py-4 lg:py-6 space-y-1 ${isMobileOpen ? 'block' : 'hidden lg:block'} transition-all`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileOpen(false); // Auto close menu after selecting on mobile
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium tracking-tight transition duration-150 group ${
                  isActive 
                    ? 'bg-[#1a264a] text-[#00D2C4] font-semibold border-l-4 border-[#00D2C4]' 
                    : 'hover:bg-[#151f3c] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-[#00D2C4]' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.id === 'upload' && customUploadedCount > 0 && (
                  <span className="bg-[#00D2C4]/20 text-[#00D2C4] text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                    {customUploadedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE ROLE BADGE (BOTTOM FOOTER) */}
      <div className={`p-4 border-t border-[#161F3B] bg-[#070D1D] ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-[#111A2E] border border-[#232F52] p-3.5 rounded-xl space-y-1.5 hover:border-slate-705 transition">
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#00D2C4] block leading-none">
            Active Sourcing Specs
          </span>
          <p className="text-xs font-bold text-white leading-normal truncate capitalize flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
            {activeRole.title.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
