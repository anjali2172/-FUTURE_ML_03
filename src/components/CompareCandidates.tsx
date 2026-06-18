import React, { useState } from 'react';
import { Candidate } from '../types';
import { 
  Users, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  GraduationCap, 
  Flame, 
  Award,
  BookOpen
} from 'lucide-react';

interface CompareCandidatesProps {
  candidates: Candidate[];
}

export default function CompareCandidates({ candidates }: CompareCandidatesProps) {
  const [cand1Id, setCand1Id] = useState<string>(candidates[0]?.id || "");
  const [cand2Id, setCand2Id] = useState<string>(candidates[1]?.id || "");
  const [cand3Id, setCand3Id] = useState<string>("");

  const c1 = candidates.find(c => c.id === cand1Id);
  const c2 = candidates.find(c => c.id === cand2Id);
  const c3 = candidates.find(c => c.id === cand3Id);

  // Extract a master set of skills present in selected profiles to do comparison matrix
  const getSkillsUnion = () => {
    const sSet = new Set<string>();
    [c1, c2, c3].forEach(c => {
      if (c) c.skills.forEach(s => sSet.add(s.toLowerCase()));
    });
    return Array.from(sSet).slice(0, 15); // limit to top 15 comparison rows
  };

  const skillsUnion = getSkillsUnion();

  const getStatusColor = (status?: string) => {
    if (status === "Highly Recommended") return "text-emerald-400";
    if (status === "Shortlisted") return "text-cyan-400";
    if (status === "Under Review") return "text-amber-400";
    return "text-slate-400";
  };

  return (
    <div className="space-y-6" id="compare-candidates-section">
      {/* TITLE CONTAINER */}
      <div>
        <h1 className="text-2xl font-semibold font-display text-white tracking-tight">Side-by-Side Assessment</h1>
        <p className="text-xs text-slate-400 mt-1">
          Select and overlay up to three applicant profiles to review core credentials synchronously.
        </p>
      </div>

      {/* SELECTORS GRID */}
      <div className="bg-[#161F38] border border-[#232F52] p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Candidate 1:</label>
          <select
            value={cand1Id}
            onChange={(e) => setCand1Id(e.target.value)}
            className="w-full bg-slate-950 border border-[#2F447F] text-xs text-slate-300 py-2 px-3 rounded-lg outline-none focus:border-teal-400"
          >
            <option value="">-- Choose Candidate --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.matchScore}%)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Candidate 2:</label>
          <select
            value={cand2Id}
            onChange={(e) => setCand2Id(e.target.value)}
            className="w-full bg-slate-950 border border-[#2F447F] text-xs text-slate-300 py-2 px-3 rounded-lg outline-none focus:border-teal-400"
          >
            <option value="">-- Choose Candidate --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.matchScore}%)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">Candidate 3 (Optional):</label>
          <select
            value={cand3Id}
            onChange={(e) => setCand3Id(e.target.value)}
            className="w-full bg-slate-950 border border-[#2F447F] text-xs text-slate-300 py-2 px-3 rounded-lg outline-none focus:border-teal-400"
          >
            <option value="">-- None Selected --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.matchScore}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* MATRIX DETAILS GRID */}
      {c1 || c2 || c3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PROFILE COLUMN 1 */}
          {c1 && (
            <div className="bg-[#161F38] border-t-4 border-teal-500 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[9px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">PROFILE ALPHA</span>
                <h3 className="text-base font-bold text-white mt-1">{c1.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c1.fileName}</p>
              </div>

              {/* Score ring */}
              <div className="bg-slate-950/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Match Score</span>
                  <p className="text-xl font-mono font-bold text-teal-400">{c1.matchScore}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Verdict</span>
                  <p className={`text-xs font-semibold ${getStatusColor(c1.status)}`}>{c1.status}</p>
                </div>
              </div>

              {/* Education block */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Credentials</p>
                <div className="text-xs space-y-1 bg-slate-950/20 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-250 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {c1.contact.degrees[0] || "Unknown Degree"}
                  </p>
                  <p className="text-teal-300 font-semibold truncate">
                    🏫 {c1.contact.universities[0] || "Self-study Route"}
                  </p>
                  <p className="text-slate-400 font-mono text-[10px]">CGPA Rank: {c1.contact.cgpaPercentage}</p>
                </div>
              </div>

              {/* Location & phone */}
              <div className="text-xs space-y-1 text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {c1.contact.location}
                </p>
                <p>📞 {c1.contact.phone}</p>
                <p>✉ {c1.contact.email}</p>
              </div>
            </div>
          )}

          {/* PROFILE COLUMN 2 */}
          {c2 && (
            <div className="bg-[#161F38] border-t-4 border-cyan-500 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">PROFILE BETA</span>
                <h3 className="text-base font-bold text-white mt-1">{c2.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c2.fileName}</p>
              </div>

              {/* Score ring */}
              <div className="bg-slate-950/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Match Score</span>
                  <p className="text-xl font-mono font-bold text-cyan-450">{c2.matchScore}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Verdict</span>
                  <p className={`text-xs font-semibold ${getStatusColor(c2.status)}`}>{c2.status}</p>
                </div>
              </div>

              {/* Education block */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Credentials</p>
                <div className="text-xs space-y-1 bg-slate-950/20 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-250 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {c2.contact.degrees[0] || "Unknown Degree"}
                  </p>
                  <p className="text-cyan-300 font-semibold truncate">
                    🏫 {c2.contact.universities[0] || "Self-study Route"}
                  </p>
                  <p className="text-slate-400 font-mono text-[10px]">CGPA Rank: {c2.contact.cgpaPercentage}</p>
                </div>
              </div>

              {/* Location & phone */}
              <div className="text-xs space-y-1 text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {c2.contact.location}
                </p>
                <p>📞 {c2.contact.phone}</p>
                <p>✉ {c2.contact.email}</p>
              </div>
            </div>
          )}

          {/* PROFILE COLUMN 3 */}
          {c3 ? (
            <div className="bg-[#161F38] border-t-4 border-amber-500 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[9px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">PROFILE GAMMA</span>
                <h3 className="text-base font-bold text-white mt-1">{c3.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c3.fileName}</p>
              </div>

              {/* Score ring */}
              <div className="bg-slate-950/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Match Score</span>
                  <p className="text-xl font-mono font-bold text-amber-400">{c3.matchScore}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Verdict</span>
                  <p className={`text-xs font-semibold ${getStatusColor(c3.status)}`}>{c3.status}</p>
                </div>
              </div>

              {/* Education block */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Credentials</p>
                <div className="text-xs space-y-1 bg-slate-950/20 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-250 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {c3.contact.degrees[0] || "Unknown Degree"}
                  </p>
                  <p className="text-amber-300 font-semibold truncate">
                    🏫 {c3.contact.universities[0] || "Self-study Route"}
                  </p>
                  <p className="text-slate-400 font-mono text-[10px]">CGPA Rank: {c3.contact.cgpaPercentage}</p>
                </div>
              </div>

              {/* Location & phone */}
              <div className="text-xs space-y-1 text-slate-400">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {c3.contact.location}
                </p>
                <p>📞 {c3.contact.phone}</p>
                <p>✉ {c3.contact.email}</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#161F38]/40 border-2 border-dashed border-[#232F52] rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
              <Users className="w-8 h-8 text-slate-655 mb-2" />
              <p className="text-slate-400 text-xs">Choose a third candidate above to expand comparison matrix side-by-side.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs bg-[#161F38] rounded-2xl border border-slate-800">
          Select candidates above to display comparison metrics.
        </div>
      )}

      {/* DETAILED SKILLS INTERSECTION ROW MATRIX */}
      {(c1 || c2) && (
        <div className="bg-[#161F38] border border-[#232F52] rounded-2xl p-5">
          <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4">
            Detailed Technologies Presence Checklists
          </h4>

          <div className="space-y-2">
            <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              <span>Verified Skill Title</span>
              <span className="text-center">{c1?.name || "Alpha"}</span>
              <span className="text-center">{c2?.name || "Beta"}</span>
              <span className="text-center">{c3?.name || "Gamma"}</span>
            </div>

            {skillsUnion.map((skill) => {
              const hasC1 = c1?.skills.some(s => s.toLowerCase() === skill);
              const hasC2 = c2?.skills.some(s => s.toLowerCase() === skill);
              const hasC3 = c3?.skills.some(s => s.toLowerCase() === skill);

              return (
                <div key={skill} className="grid grid-cols-4 items-center text-xs text-slate-300 py-2 border-b border-slate-900/40 hover:bg-slate-950/20 transition">
                  <span className="capitalize font-mono font-medium">{skill}</span>
                  <div className="flex justify-center">
                    {hasC1 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="flex justify-center">
                    {hasC2 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="flex justify-center">
                    {c3 ? (hasC3 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-slate-600" />) : <span className="text-slate-700 font-mono">-</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
