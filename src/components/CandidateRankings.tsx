import React, { useState } from 'react';
import { Candidate, JobRole } from '../types';
import { 
  Trophy, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Lightbulb,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  SlidersHorizontal,
  RotateCcw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CandidateRankingsProps {
  candidates: Candidate[];
  jdText: string;
}

interface CoachResponse {
  executiveSummary: string;
  culturalFitScore: number;
  topStrengths: string[];
  learningCurriculum: string[];
  resumeImprovementTips: string[];
}

export default function CandidateRankings({ candidates, jdText }: CandidateRankingsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [tier1Only, setTier1Only] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedDegree, setSelectedDegree] = useState<string>("");

  // Dynamically extract unique sorted skills and degrees across all candidates in memory
  const uniqueSkillsSetList = React.useMemo(() => {
    const listSet = new Set<string>();
    candidates.forEach(cand => {
      if (cand.skills && Array.isArray(cand.skills)) {
        cand.skills.forEach(s => {
          if (s && s.trim()) {
            listSet.add(s.trim());
          }
        });
      }
    });
    return Array.from(listSet).sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const uniqueDegreesSetList = React.useMemo(() => {
    const listSet = new Set<string>();
    candidates.forEach(cand => {
      if (cand.contact && cand.contact.degrees && Array.isArray(cand.contact.degrees)) {
        cand.contact.degrees.forEach(d => {
          if (d && d.trim()) {
            listSet.add(d.trim());
          }
        });
      }
    });
    return Array.from(listSet).sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMinScoreFilter(0);
    setTier1Only(false);
    setSelectedSkill("");
    setSelectedDegree("");
  };

  const isAnyFilterActive = searchQuery || minScoreFilter > 0 || tier1Only || selectedSkill || selectedDegree;

  // States for server-side Gemini Career Coach responses
  const [coachData, setCoachData] = useState<Record<string, CoachResponse>>({});
  const [coachingLoading, setCoachingLoading] = useState<Record<string, boolean>>({});
  const [coachingError, setCoachingError] = useState<Record<string, string>>({});

  const handleAskAI = async (cand: Candidate) => {
    const id = cand.id;
    setCoachingLoading(prev => ({ ...prev, [id]: true }));
    setCoachingError(prev => ({ ...prev, [id]: "" }));
    
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: cand.name,
          resumeText: cand.rawText,
          jdText: jdText
        })
      });
      
      if (!res.ok) {
        throw new Error('Server returned error status code.');
      }
      
      const data = await res.json();
      setCoachData(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      setCoachingError(prev => ({ 
        ...prev, 
        [id]: "The Gemini API key is missing or invalid. Verify credentials in Cloud Settings." 
      }));
    } finally {
      setCoachingLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case "Highly Recommended":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Shortlisted":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Under Review":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  // Filter pipeline
  const filteredCandidates = candidates.filter(cand => {
    // 1. Search name, skills, fileName, or raw resume text content
    const matchesSearch = !searchQuery || 
                          cand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          cand.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (cand.rawText && cand.rawText.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 2. Minimum Match Score Slider
    const matchesScore = (cand.matchScore || 0) >= minScoreFilter;
    
    // 3. Indian Market Tier-1 Universities filter
    const matchesTier1 = !tier1Only || cand.contact.universities.length > 0;

    // 4. Specific Mapped Skill Filter
    const matchesSkill = !selectedSkill || 
                          cand.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase());

    // 5. Degree Type matching
    const matchesDegree = !selectedDegree || 
                           cand.contact.degrees.some(d => d.toLowerCase() === selectedDegree.toLowerCase());

    return matchesSearch && matchesScore && matchesTier1 && matchesSkill && matchesDegree;
  });

  // Export report simulations
  const handleExportCSV = () => {
    const headers = "Name,Score,Status,Email,Phone,Education,CGPA\n";
    const rows = filteredCandidates.map(c => 
      `"${c.name}",${c.matchScore}%,"${c.status}","${c.contact.email}","${c.contact.phone}","${c.contact.degrees[0]}","${c.contact.cgpaPercentage}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Resume_ATS_Rankings.csv');
    a.click();
  };

  return (
    <div className="space-y-6" id="candidate-rankings-tab-layout">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-white tracking-tight">Candidate Rankings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by mathematical TF-IDF cosine weights against job specifications.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-[#202E54] hover:bg-[#2c3d70] text-white border border-[#232F52] px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition duration-150 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          Export Rankings CSV
        </button>
      </div>

      {/* SEARCH AND ADVANCED FILTERS BAR */}
      <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl space-y-5 shadow-lg">
        {/* Row 1: Search query & Minimum match score slider */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          {/* Search input bar */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Search Applicants or Resume Bio
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate name, resume context, or technology keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-[#232F52] text-xs text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-teal-400 transition-all font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Range filter slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <span>Minimum Match Score</span>
              <span className="font-mono text-xs font-extrabold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-500/20">
                {minScoreFilter}%+
              </span>
            </div>
            <div className="flex items-center gap-3 py-1 bg-slate-950/30 border border-[#232F52]/50 rounded-xl px-4 h-[38px]">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-950/80 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Secondary dropdowns for target skills, degree types, and status checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center pt-3 border-t border-[#232F52]/50">
          {/* Skill dynamic checklist */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Filter by Specific Skill
            </label>
            <div className="relative">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-slate-950/60 border border-[#232F52] text-xs text-slate-200 py-2.5 px-3.5 rounded-xl outline-none focus:border-teal-400 cursor-pointer appearance-none"
              >
                <option value="">All Skills ({uniqueSkillsSetList.length})</option>
                {uniqueSkillsSetList.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Academic Degree dynamic checklist */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Filter by Degree Level
            </label>
            <div className="relative">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full bg-slate-950/60 border border-[#232F52] text-xs text-slate-200 py-2.5 px-3.5 rounded-xl outline-none focus:border-teal-400 cursor-pointer appearance-none"
              >
                <option value="">All Degrees ({uniqueDegreesSetList.length})</option>
                {uniqueDegreesSetList.map(deg => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Tier 1 Filter Pedigree */}
          <div className="flex items-center gap-3 pt-4 md:pt-4 lg:pt-5">
            <input
              type="checkbox"
              id="tier1Checkbox"
              checked={tier1Only}
              onChange={(e) => setTier1Only(e.target.checked)}
              className="rounded border-[#2F447F] text-teal-500 focus:ring-teal-400 bg-slate-950 h-4.5 w-4.5 cursor-pointer transition"
            />
            <label htmlFor="tier1Checkbox" className="text-xs text-slate-350 cursor-pointer select-none hover:text-white transition-colors">
              Tier-1 Colleges Only (IIT/NIT)
            </label>
          </div>

          {/* Reset button conditionally showing */}
          <div className="flex justify-end md:col-span-3 lg:col-span-1 pt-4 md:pt-4 lg:pt-5">
            <AnimatePresence>
              {isAnyFilterActive && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleClearFilters}
                  className="w-full lg:w-auto bg-slate-900 border border-[#2F447F] hover:bg-slate-800 text-slate-300 hover:text-white text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md group"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-[-45deg] transition" />
                  Clear All Filters
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* CORE LEADERBOARD LIST */}
      <div className="bg-[#161F38] border border-[#232F52] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6 min-w-[200px]">Candidate Details</th>
                <th className="py-4 px-6">Education & Standards</th>
                <th className="py-4 px-4 text-center w-28">Match Score</th>
                <th className="py-4 px-6 text-center w-40">Classification</th>
                <th className="py-4 px-6 text-right w-28">Aero Specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((cand, index) => {
                  const isExpanded = expandedId === cand.id;
                  
                  return (
                    <React.Fragment key={cand.id}>
                      {/* TABLE ROW */}
                      <tr className={`hover:bg-slate-900/40 transition duration-150 ${isExpanded ? 'bg-slate-950/40' : ''}`}>
                        {/* RANKING COL */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center font-mono font-bold text-xs w-7 h-7 rounded-full ${
                            index === 0 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : index === 1 
                                ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                : 'text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                        </td>

                        {/* NAME AND SOURCE */}
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-display font-semibold text-white text-sm hover:text-teal-400 transition">
                              {cand.name}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1 leading-none font-mono">
                              <FileText className="w-3 h-3" />
                              {cand.fileName}
                            </span>
                          </div>
                        </td>

                        {/* EDUCATION & Pedigree */}
                        <td className="py-4 px-6 text-slate-300 text-xs">
                          {cand.contact.degrees.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {cand.contact.degrees.slice(0, 1).map((d, i) => (
                                  <span key={i} className="bg-[#1F2B4E] text-slate-300 text-[9px] font-semibold px-2 py-0.5 rounded-md">
                                    {d}
                                  </span>
                                ))}
                                {cand.contact.universities.length > 0 && (
                                  <span className="bg-teal-900/30 text-teal-300 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-teal-500/10">
                                    🏫 {cand.contact.universities[0]}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400"> Marks Index: <span className="text-white font-mono font-bold">{cand.contact.cgpaPercentage}</span></p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Unparsed credentials</span>
                          )}
                        </td>

                        {/* SCORES AND PROGRESS BAR */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-block">
                            <span className="font-mono font-bold text-sm text-teal-400">
                              {cand.matchScore}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-950 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-teal-400" 
                                style={{ width: `${cand.matchScore || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* CLASS STATUS BADGE */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block text-[10px] font-bold px-3 py-1.5 rounded-full border ${getStatusBadgeStyle(cand.status)}`}>
                            {cand.status}
                          </span>
                        </td>

                        {/* EXPAND Review Button */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : cand.id)}
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0"
                          >
                            {isExpanded ? "Hide" : "Review"}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDABLE INSIGHT GRID */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-slate-950/40 px-6 py-6 border-b border-slate-800">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden space-y-6 text-slate-300 text-xs"
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Credentials list */}
                                  <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl">
                                    <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                                      Credential Details
                                    </h4>
                                    
                                    <div className="space-y-3">
                                      <p><strong>Email Address:</strong> <a href={`mailto:${cand.contact.email}`} className="text-teal-400 hover:underline">{cand.contact.email}</a></p>
                                      <p><strong>Mobile:</strong> <span className="font-mono">{cand.contact.phone}</span></p>
                                      <p><strong>Interview Zone:</strong> {cand.contact.location}</p>
                                      <div>
                                        <strong>Target Skills Identified:</strong>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {cand.skills.map(s => (
                                            <span key={s} className="bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5 rounded capitalize">
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Automatic Gap Assessment */}
                                  <div className="bg-[#161F38] border border-[#232F52] p-5 rounded-2xl flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
                                        Skill Alignment Map
                                      </h4>
                                      <p className="text-slate-400 leading-normal mb-3">
                                        Matched against core requirements. Ideal targets met are automatically classified below.
                                      </p>
                                      <div className="mt-2 text-xs">
                                        <div className="flex items-center justify-between text-slate-400 mb-1">
                                          <span>Hiring Compatibility Confidence</span>
                                          <span className="font-mono font-bold text-teal-400">{cand.matchScore}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                                          <div className="h-full bg-teal-400 rounded-full" style={{ width: `${cand.matchScore}%` }} />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action consulting AI */}
                                    <div className="mt-6">
                                      <button
                                        onClick={() => handleAskAI(cand)}
                                        disabled={coachingLoading[cand.id]}
                                        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:from-slate-700 disabled:to-slate-800 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2"
                                      >
                                        <Sparkles className="w-3.5 h-3.5 fill-slate-950 animate-pulse" />
                                        {coachingLoading[cand.id] ? "Consulting AI Career Advisor..." : "Verify with Gemini AI Career Advisor"}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* CARER COACH DECK */}
                                <AnimatePresence>
                                  {(coachData[cand.id] || coachingLoading[cand.id] || coachingError[cand.id]) && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      className="bg-slate-950 rounded-2xl p-5 border border-[#232F52] space-y-4 shadow-2xl relative"
                                    >
                                      {coachingLoading[cand.id] && (
                                        <div className="flex flex-col items-center justify-center py-6">
                                          <div className="w-8 h-8 rounded-full border-2 border-t-teal-400 animate-spin border-slate-700" />
                                          <p className="text-xs text-slate-400 mt-2">Computing linguistic parameters and Indian educational indices...</p>
                                        </div>
                                      )}

                                      {coachingError[cand.id] && (
                                        <div className="text-center py-4 text-rose-400">
                                          <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                                          <p>{coachingError[cand.id]}</p>
                                        </div>
                                      )}

                                      {coachData[cand.id] && (
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                            <span className="font-semibold text-white flex items-center gap-1">
                                              <Sparkles className="w-4 h-4 text-teal-400" />
                                              Gemini AI Deep Synthesis Report
                                            </span>
                                            <span className="bg-teal-400/20 text-teal-300 font-mono text-xs px-2.5 py-1 rounded-md">
                                              Cultural Index: {coachData[cand.id].culturalFitScore}%
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                              <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Executive Summary</p>
                                                <p className="text-slate-300 leading-relaxed">{coachData[cand.id].executiveSummary}</p>
                                              </div>
                                              <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Identified Strengths
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                  {coachData[cand.id].topStrengths.map((str, i) => (
                                                    <li key={i} className="text-slate-300">{str}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            </div>

                                            <div className="space-y-3">
                                              <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Bridge Curriculums
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                  {coachData[cand.id].learningCurriculum.map((lec, i) => (
                                                    <li key={i} className="text-slate-300">{lec}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                              <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> CV Upgrades
                                                </p>
                                                <ul className="list-disc pl-4 space-y-1">
                                                  {coachData[cand.id].resumeImprovementTips.map((tip, i) => (
                                                    <li key={i} className="text-slate-300">{tip}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic text-xs">
                    No candidates matched the specified filters. Revise query parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
