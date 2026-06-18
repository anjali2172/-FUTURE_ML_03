import React from 'react';
import { Candidate, JobRole } from '../types';
import { 
  Users, 
  Trophy, 
  Percent, 
  Award, 
  Sparkles, 
  Briefcase, 
  Activity, 
  ArrowUpRight, 
  Compass, 
  ExternalLink,
  Target,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  candidates: Candidate[];
  activeRole: JobRole;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ candidates, activeRole, onNavigate }: DashboardProps) {
  const totalResumes = candidates.length;
  
  // Calculate analytics
  const topCandidate = candidates[0];
  const avgScore = totalResumes > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0) / totalResumes) 
    : 0;
  const highlyRecommendedCount = candidates.filter(c => c.status === "Highly Recommended").length;

  // Extract skills metrics
  const skillCountMap: Record<string, number> = {};
  candidates.forEach(cand => {
    cand.skills.forEach(skill => {
      skillCountMap[skill] = (skillCountMap[skill] || 0) + 1;
    });
  });

  const sortedSkills = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalSkillTicks = sortedSkills.reduce((sum, [_, cnt]) => sum + cnt, 0) || 1;

  return (
    <div className="space-y-6" id="dashboard-tab-layout">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-white tracking-tight">Recruitment Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of resume metrics for: <span className="text-emerald-400 font-semibold font-mono underline decoration-wavy">{activeRole.title}</span>
          </p>
        </div>
        <button 
          onClick={() => onNavigate('upload')}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-display font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/10 transition duration-150 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse" />
          + Upload Resumes
        </button>
      </div>

      {/* METRIC CARD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL RESUMES */}
        <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Resumes</p>
            <h3 className="text-2xl font-mono font-bold text-white mt-1.5">{totalResumes}</h3>
          </div>
          <div className="bg-[#212E52] p-3 rounded-xl text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* TOP CANDIDATE */}
        <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Candidate</p>
            <h3 className="text-md font-display font-bold text-white mt-1.5 truncate max-w-[140px]">
              {topCandidate ? topCandidate.name : 'No Candidates'}
            </h3>
          </div>
          <div className="bg-[#212E52] p-3 rounded-xl text-teal-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* AVG ATS SCORE */}
        <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg ATS Score</p>
            <h3 className="text-2xl font-mono font-bold text-white mt-1.5">
              {avgScore}/100
            </h3>
          </div>
          <div className="bg-[#212E52] p-3 rounded-xl text-cyan-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* HIGHLY RECOMMENDED */}
        <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended</p>
            <h3 className="text-2xl font-mono font-bold text-white mt-1.5">
              {highlyRecommendedCount}
            </h3>
          </div>
          <div className="bg-[#212E52] p-3 rounded-xl text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ATS MATCH DISTRIBUTION BAR CHART */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider">
              ATS Match Distribution
            </span>
            <p className="text-xs text-slate-400 mt-2">Comparison of compatibility weight scores across the loaded roster.</p>
          </div>

          <div className="mt-6 space-y-4">
            {totalResumes > 0 ? (
              candidates.slice(0, 5).map((cand, index) => (
                <div key={cand.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-350">
                    <span className="font-medium truncate max-w-[180px]">{cand.name}</span>
                    <span className="font-mono text-emerald-400 font-semibold">{cand.matchScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-505 bg-gradient-to-r ${
                        index === 0 
                          ? 'from-teal-500 to-emerald-400' 
                          : index === 1 
                            ? 'from-cyan-500 to-teal-400' 
                            : 'from-blue-500 to-cyan-400'
                      }`}
                      style={{ width: `${cand.matchScore || 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-450 italic">
                No active candidates. Upload some files to populate charts.
              </div>
            )}
          </div>
        </div>

        {/* TOP SKILLS COVERAGE DONUT / PIE REPRESENTATION */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-[#1d2744] text-slate-200 font-bold px-2.5 py-1 rounded-full border border-slate-700 uppercase tracking-wider">
              Top Skills Coverage
            </span>
            <p className="text-xs text-slate-400 mt-2">Percentage density of most commonly isolated technology terms.</p>
          </div>

          <div className="my-4 flex items-center justify-center relative">
            {/* Visual SVG Donut Chart */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0B132B" strokeWidth="3" />
              {sortedSkills.map(([skill, count], idx) => {
                const percentage = Math.round((count / totalSkillTicks) * 100);
                const prevPercentages = sortedSkills
                  .slice(0, idx)
                  .reduce((sum, [_, cnt]) => sum + Math.round((cnt / totalSkillTicks) * 100), 0);
                
                // Colors dictionary
                const colors = ["#00D2C4", "#06B6D4", "#3B82F6", "#10B981", "#F59E0B"];
                const color = colors[idx % colors.length];

                return (
                  <circle
                    key={skill}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={`${percentage} ${100 - percentage}`}
                    strokeDashoffset={100 - prevPercentages}
                  />
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase">Top skill</span>
              <span className="text-xs font-mono font-bold text-white capitalize">{sortedSkills[0]?.[0] || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {sortedSkills.map(([skill, count], idx) => {
              const markerColors = ["bg-[#00D2C4]", "bg-cyan-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
              return (
                <div key={skill} className="flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${markerColors[idx % markerColors.length]}`} />
                    <span className="capitalize truncate max-w-[100px]">{skill}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-400">{count} profiles</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EXPERIENCE DISTRIBUTION & SYSTEM QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EDUCATION & EXPERIENCE MATRIX */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-5">
          <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4">
            Demographics & Academic Pedigrees
          </h4>
          
          <div className="space-y-4">
            {/* IIT / NIT / Premier ratio */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Tier-1 Indian Institution Rate (IIT / NIT / BITS)</span>
                <span className="font-mono font-semibold text-teal-400">
                  {totalResumes > 0 
                    ? Math.round((candidates.filter(c => c.contact.universities.length > 0).length / totalResumes) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full" 
                  style={{ 
                    width: `${totalResumes > 0 
                      ? (candidates.filter(c => c.contact.universities.length > 0).length / totalResumes) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Premium Masters Ratio */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Masters Pedigree Rate (M.Tech / MCA / MBA)</span>
                <span className="font-mono font-semibold text-cyan-400">
                  {totalResumes > 0 
                    ? Math.round((candidates.filter(c => c.contact.degrees.some(d => d.includes('Master') || d.includes('M.Tech') || d.includes('MCA'))).length / totalResumes) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full" 
                  style={{ 
                    width: `${totalResumes > 0 
                      ? (candidates.filter(c => c.contact.degrees.some(d => d.includes('Master') || d.includes('M.Tech') || d.includes('MCA'))).length / totalResumes) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Location matches */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 uppercase block mb-1.5 font-bold">Key Sourcing Locations Met:</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(candidates.map(c => c.contact.location.split(',')[0]))).filter(Boolean).map(loc => (
                  <span key={loc} className="bg-slate-900 border border-slate-850 text-slate-300 text-[10px] font-mono px-2 py-1 rounded-md">
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM QUICK ACTIONS */}
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-1.5">
              System Quick Actions
            </h4>
            <p className="text-xs text-slate-400">Streamline applicant tracking, configure weights, and compare profiles.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={() => onNavigate('compare')}
              className="bg-[#212E52] hover:bg-[#2c3d6d] p-3 rounded-xl text-left border border-slate-700 text-xs transition group"
            >
              <div className="text-teal-400 font-semibold flex items-center gap-1">
                Compare Matrix <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Overlay technical credentials side-by-side.</p>
            </button>

            <button 
              onClick={() => onNavigate('rankings')}
              className="bg-[#212E52] hover:bg-[#2c3d6d] p-3 rounded-xl text-left border border-slate-700 text-xs transition group"
            >
              <div className="text-cyan-400 font-semibold flex items-center gap-1">
                Leaderboards <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Review math rankings and download reports.</p>
            </button>

            <button 
              onClick={() => onNavigate('jd')}
              className="bg-[#212E52] hover:bg-[#2c3d6d] p-3 rounded-xl text-left border border-slate-700 text-xs transition group"
            >
              <div className="text-amber-400 font-semibold flex items-center gap-1">
                Job Categories <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Configure active matching specs.</p>
            </button>

            <button 
              onClick={() => onNavigate('admin')}
              className="bg-[#212E52] hover:bg-[#2c3d6d] p-3 rounded-xl text-left border border-slate-700 text-xs transition group"
            >
              <div className="text-rose-400 font-semibold flex items-center gap-1">
                Vetting Weights <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Audit security keys and recommendation criteria.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
