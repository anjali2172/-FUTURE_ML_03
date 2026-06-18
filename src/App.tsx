import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobDescription from './components/JobDescription';
import UploadResumes from './components/UploadResumes';
import CandidateRankings from './components/CandidateRankings';
import CompareCandidates from './components/CompareCandidates';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import { Candidate, JobRole } from './types';
import { getInitialCandidates, PREDEFINED_ROLES } from './data/mockCandidates';
import { calculateSimilarityScores } from './utils/tfidf';
import { cleanText } from './utils/nlp';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, Briefcase, ChevronDown, Info, X, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isRoleInfoOpen, setIsRoleInfoOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  // Track customized role models
  const [jobRoles, setJobRoles] = useState<JobRole[]>(PREDEFINED_ROLES);
  const [activeRole, setActiveRole] = useState<JobRole>(PREDEFINED_ROLES[3]); // Default Cyber Security Analyst (pre-selected to match mockup)
  const [customCandidates, setCustomCandidates] = useState<Candidate[]>([]);
  
  const [globalNotif, setGlobalNotif] = useState("");
  const [highlightSourcing, setHighlightSourcing] = useState(false);

  // Trigger brief highlight effect on role selection changes
  useEffect(() => {
    setHighlightSourcing(true);
    const timer = setTimeout(() => {
      setHighlightSourcing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeRole.id]);

  // Process similarity and rank candidates
  useEffect(() => {
    runScreeningPipeline(activeRole, customCandidates);
  }, [activeRole, customCandidates]);

  const runScreeningPipeline = (currentRole: JobRole, additionalCandidates: Candidate[]) => {
    const baseCandidates = getInitialCandidates();
    const mergedList = [...additionalCandidates, ...baseCandidates];

    // Compute semantic match criteria using TF-IDF
    const cleanedJd = cleanText(currentRole.description);
    const cleanedResumes = mergedList.map(cand => cand.cleanedText);

    const similarities = calculateSimilarityScores(cleanedResumes, cleanedJd);

    const scoredList = mergedList.map((cand, idx) => {
      const score = similarities[idx] || 0;
      
      // Compute recommendation categorization dynamically
      let status: "Highly Recommended" | "Shortlisted" | "Under Review" | "Not Suitable";
      if (score >= 65) {
        status = "Highly Recommended";
      } else if (score >= 45) {
        status = "Shortlisted";
      } else if (score >= 25) {
        status = "Under Review";
      } else {
        status = "Not Suitable";
      }

      return {
        ...cand,
        matchScore: score,
        status
      };
    });

    // Rank candidates by matchScore descending
    const sortedList = scoredList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setCandidates(sortedList);
  };

  const handleSelectRole = (role: JobRole) => {
    setActiveRole(role);
  };

  const handleUpdateRoleText = (roleId: string, newText: string) => {
    setJobRoles(prev => 
      prev.map(r => r.id === roleId ? { ...r, description: newText } : r)
    );
    // Real time update active description
    if (activeRole.id === roleId) {
      setActiveRole(prev => ({ ...prev, description: newText }));
    }
  };

  const handleAddCustomCandidates = (newCandidates: Candidate[]) => {
    setCustomCandidates(prev => [...newCandidates, ...prev]);
  };

  const notifyUser = (msg: string) => {
    setGlobalNotif(msg);
    setTimeout(() => setGlobalNotif(""), 4000);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header Accent Box
      doc.setFillColor(11, 18, 38); 
      doc.rect(0, 0, 210, 38, 'F');
      
      // Header Title
      doc.setTextColor(0, 210, 196); // Teal
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('AI RESUME RANKER', 14, 18);
      
      // Header Subtitle
      doc.setTextColor(173, 181, 189); // Light Gray
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('RECRUITMENT COCKPIT - POSITION SPECS & CANDIDATES REPORT', 14, 26);
      
      // Meta Date Info
      const dateStr = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated Date: ${dateStr}`, 14, 32);

      let y = 52;
      
      // Section: Active Specifications
      doc.setTextColor(11, 18, 38);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('1. Position Matching Criteria Specifications', 14, y);
      
      y += 5;
      doc.setDrawColor(35, 47, 82);
      doc.setLineWidth(0.5);
      doc.line(14, y, 196, y);
      
      y += 8;
      doc.setTextColor(45, 55, 72);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Target Title:', 14, y);
      
      doc.setTextColor(0, 150, 136); // Teal contrast
      doc.text(activeRole.title, 40, y);
      
      y += 7;
      doc.setTextColor(45, 55, 72);
      doc.setFont('Helvetica', 'bold');
      doc.text('Parsed Skills Target:', 14, y);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(74, 85, 104);
      const targetSkillsStr = activeRole.skills.join(', ');
      const splitTargetSkills = doc.splitTextToSize(targetSkillsStr, 140);
      doc.text(splitTargetSkills, 52, y);
      
      y += (splitTargetSkills.length * 5) + 3;
      
      doc.setTextColor(45, 55, 72);
      doc.setFont('Helvetica', 'bold');
      doc.text('Job Description Details:', 14, y);
      
      y += 5;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(74, 85, 104);
      const descriptionToRender = activeRole.description.replace(/\s+/g, ' ');
      const splitDesc = doc.splitTextToSize(descriptionToRender, 182);
      doc.text(splitDesc, 14, y);
      
      y += (splitDesc.length * 5) + 12;
      
      // Section Headline: Candidates Scoring Summary
      if (y > 220) {
        doc.addPage();
        y = 25;
      }
      
      doc.setTextColor(11, 18, 38);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('2. Ranked Candidate Scorecard Summary', 14, y);
      
      y += 5;
      doc.line(14, y, 196, y);
      
      y += 10;
      
      // Table Header Row
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 5, 182, 8, 'F');
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(74, 85, 104);
      doc.text('Rank & Name', 16, y);
      doc.text('Match Score', 130, y);
      doc.text('Vetting Outcome Status', 160, y);
      
      y += 8;
      
      // Top 10 candidate profiles
      const candidatesToRender = candidates.slice(0, 10);
      
      candidatesToRender.forEach((cand, index) => {
        if (y > 265) {
          doc.addPage();
          y = 25;
          
          // Reprint headers on next page
          doc.setFillColor(241, 245, 249);
          doc.rect(14, y - 5, 182, 8, 'F');
          doc.setFontSize(9);
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(74, 85, 104);
          doc.text('Rank & Name', 16, y);
          doc.text('Match Score', 130, y);
          doc.text('Vetting Outcome Status', 160, y);
          y += 8;
        }
        
        const scoreInteger = Math.round(cand.matchScore || 0);
        const isHighScorer = scoreInteger >= 65;
        
        doc.setFillColor(isHighScorer ? 240 : 255, isHighScorer ? 253 : 255, isHighScorer ? 250 : 255);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.rect(14, y - 5, 182, 18, 'FD');
        
        doc.setTextColor(45, 55, 72);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${cand.name}`, 18, y);
        
        doc.setTextColor(isHighScorer ? 13 : 74, isHighScorer ? 148 : 85, isHighScorer ? 136 : 104);
        doc.text(`${scoreInteger}% Match`, 130, y);
        doc.text(cand.status || "Shortlisted", 160, y);
        
        y += 5;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(113, 128, 150);
        
        const deg = cand.contact.degrees.join(', ') || 'Degree Inferred';
        const clg = cand.contact.universities[0] || 'Institution Vetted';
        doc.text(`Education: ${deg} at ${clg} | CGPA: ${cand.contact.cgpaPercentage || '9.0/10'}`, 18, y);
        
        y += 4.5;
        const mappedSkills = cand.skills.filter(Boolean).slice(0, 6).join(', ');
        doc.text(`Skills highlighted: ${mappedSkills}`, 18, y);
        
        y += 8.5;
      });
      
      const slugVal = activeRole.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      doc.save(`${slugVal}_sourcing_report.pdf`);
      notifyUser(`Vetting scorecard report successfully saved!`);
    } catch (error) {
      console.error(error);
      notifyUser("Oops! Failed to compile active dataset into PDF file. Please try again.");
    }
  };

  // Render correct main panel content based on tab selection
  const renderContentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            candidates={candidates} 
            activeRole={activeRole} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        );
      case 'jd':
        return (
          <JobDescription 
            roles={jobRoles} 
            activeRole={activeRole} 
            onSelectRole={handleSelectRole} 
            onUpdateRoleText={handleUpdateRoleText} 
          />
        );
      case 'upload':
        return (
          <UploadResumes 
            onCustomCandidatesAdded={handleAddCustomCandidates} 
            customCandidates={customCandidates}
            onRemoveCandidate={(id) => setCustomCandidates(prev => prev.filter(c => c.id !== id))}
            activeRole={activeRole}
            jobRoles={jobRoles}
            onSelectRole={handleSelectRole}
          />
        );
      case 'rankings':
        return (
          <CandidateRankings 
            candidates={candidates} 
            jdText={activeRole.description} 
          />
        );
      case 'compare':
        return (
          <CompareCandidates 
            candidates={candidates} 
          />
        );
      case 'admin':
        return (
          <AdminPanel 
            onNotify={notifyUser} 
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage 
            onStart={() => setActiveTab('dashboard')} 
            onCustomCandidatesAdded={handleAddCustomCandidates}
            activeRole={activeRole}
            jobRoles={jobRoles}
          />
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#070D1D] text-slate-100 font-sans overflow-hidden">
      {/* Sleek Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        activeRole={activeRole}
        customUploadedCount={customCandidates.length}
      />

      {/* Primary Cockpit Panel space */}
      <div className="flex-1 bg-gradient-to-b from-[#0B132B] via-[#070D1D] to-[#040814] p-6 lg:p-10 overflow-y-auto h-full space-y-6">
        
        {/* GLOBAL CONSOLE NOTIFICATIONS banner */}
        {globalNotif && (
          <div className="bg-teal-950/50 border border-teal-500/20 text-teal-300 p-4 rounded-xl text-xs flex items-center gap-2 animate-pulse mb-4 shadow-lg shadow-teal-500/5">
            <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{globalNotif}</span>
          </div>
        )}

        {/* ALIGNMENT TARGET JOB ROLES COCKPIT SELECTOR */}
        {activeTab !== 'landing' && (
          <div 
            id="global-role-sourcing-panel"
            className={`bg-[#111A30]/80 backdrop-blur-md p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl transition-all duration-500 transform border-2 ${
              highlightSourcing 
                ? 'border-teal-400 shadow-teal-500/20 scale-[1.015] ring-4 ring-teal-400/20' 
                : 'border-[#232F52]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20 shadow-sm shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-teal-450 font-mono font-bold uppercase tracking-wider block">MATCH ALIGNMENT PROFILE</span>
                <h2 className="text-sm font-semibold text-white tracking-tight">{activeRole.title}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <label htmlFor="globalRoleSelectVal" className="text-xs text-slate-350 font-medium shrink-0">
                Select Job Title:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    id="globalRoleSelectVal"
                    value={activeRole.id}
                    onChange={(e) => {
                      const selected = jobRoles.find(r => r.id === e.target.value);
                      if (selected) {
                        setActiveRole(selected);
                        notifyUser(`System matching weights successfully recalculated for position: ${selected.title}!`);
                      }
                    }}
                    className="bg-slate-950/90 border border-[#2F447F] text-xs text-slate-100 py-2 pl-3.5 pr-10 rounded-xl outline-none focus:border-teal-400 hover:border-slate-400 transition cursor-pointer appearance-none min-w-[260px] max-w-full font-semibold"
                  >
                    {jobRoles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400">
                    <ChevronDown className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                {/* Export PDF Button */}
                <button
                  onClick={handleExportPDF}
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 hover:border-teal-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-teal-500/5 hover:bg-teal-500/30 text-teal-200"
                  title="Export Current Job Specs and Candidate Summary PDF"
                  aria-label="Export PDF Vetting scorecard report"
                >
                  <FileDown className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="hidden sm:inline">Export PDF Report</span>
                </button>

                {/* Info and Hover Tooltip popover */}
                <div className="relative group/info">
                  <button
                    onClick={() => setIsRoleInfoOpen(true)}
                    className="p-2 bg-slate-900 border border-[#2F447F] hover:bg-slate-800 hover:border-teal-400 text-teal-400 rounded-xl transition flex items-center justify-center shadow-lg hover:shadow-teal-500/10"
                    title="View Active Matching Criteria"
                    aria-label="View Active Matching Criteria"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  {/* Elegant floating Popover/Tooltip on hover */}
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover/info:block w-80 bg-[#111A30] border border-[#2F447F] rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn text-left">
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#232F52]">
                      <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider block">
                        Matching Criteria Details
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1">{activeRole.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed mb-3">
                      {activeRole.description}
                    </p>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Scoring Weights:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeRole.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="text-[9px] bg-[#0A0E1A] text-teal-300 px-1.5 py-0.5 rounded border border-[#232F52]">
                            {skill}
                          </span>
                        ))}
                        {activeRole.skills.length > 4 && (
                          <span className="text-[9px] text-slate-500 font-mono self-center">
                            +{activeRole.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="block text-[8px] text-teal-440 mt-3 text-right font-semibold animate-pulse">
                      Click button to show Full Overlay Description
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC JOB DESCRIPTION DETAIL MODAL overlay */}
        <AnimatePresence>
          {isRoleInfoOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRoleInfoOpen(false)}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              />
              
              {/* MODAL CONTAINER */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                className="relative w-full max-w-xl bg-[#0E1629] border border-[#2F447F] rounded-2xl shadow-2xl overflow-hidden z-10"
              >
                {/* Header banner */}
                <div className="p-5 border-b border-[#232F52]/80 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
                      <Briefcase className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-450 font-mono font-bold uppercase tracking-widest block">MATCH CRITERIA PROFILE</span>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{activeRole.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRoleInfoOpen(false)}
                    className="p-1 px-2.5 bg-[#1b2745] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition text-xs font-mono font-bold"
                    title="Close Details"
                  >
                    <span className="flex items-center gap-1"><X className="w-4 h-4" /> CLOSE</span>
                  </button>
                </div>

                {/* Content body */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Job description section */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-mono">Job Description / Objective</h4>
                    <div className="p-4 bg-slate-950/60 border border-[#1d2744] rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                      {activeRole.description}
                    </div>
                  </div>

                  {/* Required skills badge map */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-mono">Weighting Alignment Skills ({activeRole.skills.length})</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      The core AI scoring pipelines use TF-IDF vectors of these matching criteria indices to calculate similarity compatibility:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeRole.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-lg font-mono flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block shrink-0 animate-pulse" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer block */}
                <div className="p-4 bg-slate-950/40 border-t border-[#232F52]/80 flex items-center justify-between text-[10px] text-slate-450 font-mono">
                  <span>POSITION ID: {activeRole.id}</span>
                  <button
                    onClick={() => setIsRoleInfoOpen(false)}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-teal-500/10"
                  >
                    Acknowledge Criteria
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContentPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
