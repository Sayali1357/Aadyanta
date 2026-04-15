import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, User as UserIcon, RefreshCcw, Mic, Volume2, Calendar, Star, FileText, ArrowRight } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { motion } from 'framer-motion';

const VAPI_PUBLIC_KEY = "b11380b4-21ad-4531-8e08-caa281d7cb3f";
const vapi = new Vapi(VAPI_PUBLIC_KEY);

type ViewState = 'landing' | 'room' | 'feedback';
type InterviewMode = 'audio' | 'text';

const MOCK_INTERVIEWS = [
  { id: 1, role: 'Frontend Developer', icon: '⚛️', color: 'bg-blue-500/20 text-blue-500' },
  { id: 2, role: 'Backend Engineer', icon: '⚙️', color: 'bg-green-500/20 text-green-500' },
  { id: 3, role: 'Data Scientist', icon: '📊', color: 'bg-purple-500/20 text-purple-500' },
  { id: 4, role: 'Product Manager', icon: '📋', color: 'bg-orange-500/20 text-orange-500' },
];

const Interview = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [isAudioMode, setIsAudioMode] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [subtitle, setSubtitle] = useState<string>("Click Start Interview to begin.");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [report, setReport] = useState<any>(null);

  // VAPI effect handles
  useEffect(() => {
    vapi.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setSubtitle(message.transcript);
      }
    });

    vapi.on('speech-start', () => setIsAiSpeaking(true));
    vapi.on('speech-end', () => setIsAiSpeaking(false));

    return () => {
      vapi.removeAllListeners();
    };
  }, []);

  const openConfig = (role: string) => {
    setSelectedRole(role);
    setShowConfigModal(true);
  };

  const startConfiguredInterview = () => {
    setShowConfigModal(false);
    setView('room');
    setInterviewStarted(false); // require explicit start button click in the room
    setSubtitle(`Ready for ${selectedRole} mock interview. Click Start.`);
  };

  const toggleCall = async () => {
    if (interviewStarted) {
      if (isAudioMode) vapi.stop();
      setInterviewStarted(false);
      setSubtitle("Interview paused.");
    } else {
      if (isAudioMode) {
        setSubtitle("Connecting to AI Interviewer...");
        try {
          // Providing an inline ephemeral assistant configuration 
          // to prevent Vapi from failing to find a hardcoded Assistant ID
          await vapi.start({
            name: "AI Mock Interviewer",
            firstMessage: "Hello! I am ready to begin your mock interview. Could you start by introducing yourself?",
            model: {
              provider: "openai",
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a professional technical interviewer conducting a mock interview. Ask relevant questions and evaluate the candidate's answers."
                }
              ]
            },
            voice: {
              provider: "11labs",
              voiceId: "bIHbv24MWmeRgasZH58o" // A standard default voice
            }
          });
          setInterviewStarted(true);
        } catch (e) {
          console.error(e);
          setSubtitle("Vapi Error: Could not start call.");
        }
      } else {
        setInterviewStarted(true);
        setSubtitle("Text mode activated. (UI only rendering)");
      }
    }
  };

  const handleRestart = () => {
    if (interviewStarted && isAudioMode) {
      vapi.stop();
    }
    setInterviewStarted(false);
    setReport(null);
    setSubtitle("Click Start Interview to begin anew.");
  };

  const handleGenerateFeedback = async () => {
    if (interviewStarted && isAudioMode) vapi.stop();
    setInterviewStarted(false);
    
    // Create the feedback report
    const feedbackData = {
      role: selectedRole,
      mode: isAudioMode ? 'audio' : 'text',
      technicalScore: 82,
      communicationScore: 88,
      finalAssessment: `During this mock ${selectedRole} interview, you demonstrated strong communication skills but missed some core technical depth based on the industry standard requirements for this role.`,
      categoryScores: [
        { name: "Technical Knowledge", score: 82, comment: "Good understanding of fundamentals." },
        { name: "Communication", score: 88, comment: "Spoke clearly and confidentially." }
      ]
    };
    
    setReport(feedbackData);
    setView('feedback');

    // Save to MongoDB
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/interview/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(feedbackData)
      });
    } catch (err) {
      console.error("Failed to save feedback to db", err);
    }
  };

  // ─── 1. LANDING VIEW ─────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="min-h-screen py-8 text-foreground relative z-10">
        <div className="container max-w-5xl">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-accent/10 border border-primary/20 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 mb-12 shadow-glow relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="flex-1 relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                Get Interview-Ready with AI-Powered Practice & Feedback
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Practice real interview questions in dynamic simulated environments and get instant, actionable feedback.
              </p>
              <Button variant="hero" size="lg" className="rounded-full shadow-glow" onClick={() => openConfig("General Practice")}>
                Start an Interview
              </Button>
            </div>
            <div className="hidden md:flex justify-center items-center w-[300px] h-[200px] bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm">
               <Bot className="w-32 h-32 text-primary opacity-80" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Your Interviews</h2>
          <p className="text-muted-foreground mb-12">You haven't taken any interviews yet.</p>

          <h2 className="text-2xl font-bold text-white mb-6">Take Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_INTERVIEWS.map((interview) => (
              <div key={interview.id} className="bg-[#0b0f19] border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${interview.color}`}>
                     {interview.icon}
                   </div>
                   <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded text-muted-foreground">General</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{interview.role} Interview</h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                   <div className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Apr 14, 2026</div>
                   <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> ---/100</div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  You haven't taken the interview yet. Try it now to improve your skills in the {interview.role} domain.
                </p>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10" onClick={() => openConfig(interview.role)}>
                  Configure Interview
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-[#0c0e14] border border-primary/30 p-8 rounded-2xl w-full max-w-md shadow-glow"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Configure Interview</h2>
              <p className="text-muted-foreground mb-6">Role: <span className="text-primary font-semibold">{selectedRole}</span></p>
              
              <div className="space-y-4 mb-8">
                <div 
                  className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${isAudioMode ? 'bg-primary/20 border-primary shadow-glow-cyan' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setIsAudioMode(true)}
                >
                  <Mic className={`w-6 h-6 ${isAudioMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="font-bold text-white">Audio Mode (Recommended)</h3>
                    <p className="text-xs text-muted-foreground">Speak directly to our advanced AI voice agent using Vapi.</p>
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${!isAudioMode ? 'bg-primary/20 border-primary shadow-glow-cyan' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setIsAudioMode(false)}
                >
                  <FileText className={`w-6 h-6 ${!isAudioMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="font-bold text-white">Text Mode</h3>
                    <p className="text-xs text-muted-foreground">Standard chat-based interview interface.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfigModal(false)}>Cancel</Button>
                <Button variant="hero" className="flex-1" onClick={startConfiguredInterview}>Launch System</Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ─── 2. FEEDBACK VIEW ────────────────────────────────────────────────────────
  if (view === 'feedback' && report) {
    return (
      <div className="min-h-screen py-12 container max-w-4xl relative z-10 text-foreground">
        <h1 className="text-4xl font-semibold mb-8 text-center text-white">
          Feedback on the Interview - <span className="capitalize text-primary">{report.role}</span>
        </h1>
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex flex-row justify-center gap-8 mb-8 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground uppercase text-sm tracking-wider">Overall:</span>
              <span className="text-3xl font-bold text-accent">{(report.technicalScore + report.communicationScore)/2}</span>
              <span className="text-xl text-white/50">/100</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center gap-3">
               <span className="text-muted-foreground uppercase text-sm tracking-wider">Date:</span>
               <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mb-8">
             <p className="text-lg leading-relaxed text-foreground/90">{report.finalAssessment}</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white b-2 border-b border-white/10 pb-2">Breakdown:</h2>
            {report.categoryScores.map((cat: any, i: number) => (
              <div key={i} className="bg-secondary/20 p-4 rounded-xl border border-white/5">
                <p className="font-bold text-primary mb-1">{i+1}. {cat.name} ({cat.score}/100)</p>
                <p className="text-muted-foreground">{cat.comment}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
             <Button variant="outline" className="flex-1 py-6 bg-secondary/30" onClick={() => setView('landing')}>
                Back to Dashboard
             </Button>
             <Button variant="hero" className="flex-1 py-6" onClick={() => { setView('room'); handleRestart(); }}>
                Retake Interview
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. INTERVIEW ROOM VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-12 flex flex-col items-center relative text-foreground">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="container max-w-6xl relative z-10 w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => setView('landing')} className="rounded-full border border-white/10">
               <ArrowRight className="w-5 h-5 rotate-180" />
             </Button>
             <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
               <Bot className="text-primary h-6 w-6" /> Interview Generator
             </h1>
           </div>

           {/* Mode Indicator */}
           <div className="flex bg-secondary/80 rounded-full px-4 py-2 border border-border/50">
             {isAudioMode ? (
                <div className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Mic size={16} /> Audio Mode Active
                </div>
             ) : (
                <div className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <FileText size={16} /> Text Mode Active
                </div>
             )}
           </div>
        </div>

        {/* Main Stage (Ethereal Command Layout) */}
        <div className="flex-1 flex items-center justify-center relative w-full h-[600px]">
          
          {/* Central Subtitle Pill */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-1/3">
             <motion.div 
               animate={{ scale: isAiSpeaking ? 1.05 : 1 }}
               className="bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-full text-center shadow-2xl relative overflow-hidden"
             >
               {isAiSpeaking && <div className="absolute inset-0 bg-primary/20 animate-pulse-slow"></div>}
               <p className="text-lg font-medium text-white/90 relative z-10">{subtitle}</p>
             </motion.div>
          </div>

          <div className="flex w-full justify-between lg:px-20 relative z-10 gap-8">
            {/* AI Interviewer Node */}
            <motion.div 
               animate={{ boxShadow: isAiSpeaking ? '0 0 50px rgba(124, 58, 237, 0.4)' : '0 0 0px transparent' }}
               className="flex-1 max-w-sm h-[480px] bg-[#0c0a1a] border border-primary/30 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
               <div className="absolute top-0 w-full h-1 bg-primary"></div>
               <div className={`h-32 w-32 rounded-full bg-white flex items-center justify-center mb-6 shadow-glow relative ${isAiSpeaking ? 'animate-pulse' : ''}`}>
                  {isAudioMode ? <Volume2 className="h-12 w-12 text-[#0c0a1a]" /> : <Bot className="h-12 w-12 text-[#0c0a1a]" />}
               </div>
               <h2 className="text-2xl font-bold tracking-wide text-white">AI Interviewer</h2>
               <p className="text-primary mt-2 uppercase tracking-widest text-xs font-semibold">System Node Active</p>
            </motion.div>

            {/* User Node */}
            <div className="flex-1 max-w-sm h-[480px] bg-[#0a0c10] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 relative group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 w-full h-1 bg-white/20"></div>
               <div className="h-32 w-32 rounded-full bg-secondary border-4 border-[#0a0c10] flex items-center justify-center mb-6 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <UserIcon className="h-12 w-12 text-muted-foreground opacity-50" />
               </div>
               <h2 className="text-2xl font-bold tracking-wide text-white">Sayali</h2>
               <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs font-semibold">Candidate Node</p>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="mt-8 flex justify-center gap-6">
           {!interviewStarted ? (
             <Button variant="hero" size="lg" className="rounded-full px-12 py-6 text-lg shadow-glow" onClick={toggleCall}>
               Start Interview
             </Button>
           ) : (
             <>
               <Button variant="outline" size="lg" className="rounded-full px-8 py-6 border-white/20 bg-secondary/50 text-white hover:bg-secondary" onClick={handleRestart}>
                 <RefreshCcw className="mr-2 h-5 w-5" /> Restart
               </Button>
               <Button variant="hero" size="lg" className="rounded-full px-8 py-6 shadow-glow bg-primary hover:bg-primary/90 text-white" onClick={handleGenerateFeedback}>
                 Generate Feedback
               </Button>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
