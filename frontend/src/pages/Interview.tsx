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
  const [interviewsHistory, setInterviewsHistory] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: string, text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/interview/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setInterviewsHistory(data.interviews);
        }
      } catch (err) {
        console.error("Failed to fetch interview history:", err);
      }
    };
    fetchHistory();
  }, [view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
        setSubtitle("Chat mode connected.");
        setChatMessages([{ role: 'model', text: `Hello! I am ready to begin your mock interview for ${selectedRole}. Can you start by telling me about yourself?` }]);
      }
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    
    // Format dialogue history
    const dialogueHistory = newMessages.map(m => `${m.role === 'model' ? 'Interviewer' : 'Candidate'}: ${m.text}`).join('\n');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/interview/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: chatInput, dialogueHistory, role: selectedRole })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', text: `System Error: ${data.message || 'AI Failed to respond.'}` }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: 'Error connecting to the AI interviewer. Please check your network or API keys.' }]);
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
    setSubtitle("Generating feedback...");
    
    try {
      const dialogueHistory = chatMessages.map(m => `${m.role === 'model' ? 'Interviewer' : 'Candidate'}: ${m.text}`).join('\n');
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/interview/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ role: selectedRole, mode: isAudioMode ? 'audio' : 'text', dialogueHistory })
      });
      
      const data = await res.json();
      if (data.success) {
        setReport(data.interview);
        setView('feedback');
        setSubtitle("Feedback generated.");
      } else {
        console.error("Failed to generate feedback:", data.message);
        setSubtitle(`Failed: ${data.message}`);
        alert(`Server Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Failed to generate feedback error:", err);
      setSubtitle("Network error. Could not connect to feedback generation.");
      alert(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // ─── BACKGROUND WRAPPER ──────────────────────────────────────────────────────
  const BackgroundGrid = () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-black overflow-hidden">
      {/* Crisp minimal grid lines (checks) */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px'
        }}
      />
      
      {/* Squares filled with 'light black' (dark grey #111) wrapping onto the grid */}
      <div className="absolute top-[120px] left-[240px] w-[120px] h-[120px] bg-[#1a1a1a]" />
      <div className="absolute top-[0px] left-[720px] w-[120px] h-[120px] bg-[#1a1a1a]" />
      <div className="absolute top-[240px] right-[240px] w-[120px] h-[120px] bg-[#1a1a1a]" />
      <div className="absolute bottom-[240px] left-[480px] w-[120px] h-[120px] bg-[#1a1a1a]" />
      <div className="absolute bottom-[0px] right-[600px] w-[120px] h-[120px] bg-[#1a1a1a]" />
      
      {/* A small red plus/crosshair accent from the image */}
      <div className="absolute top-[140px] left-[80px] text-red-500/50 font-light text-xl">+</div>
      
      {/* Soft overlay to blend it all into the dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/50 to-black opacity-80" />
    </div>
  );

  // ─── 1. LANDING VIEW ─────────────────────────────────────────────────────────
  const renderLanding = () => (
      <div className="py-8 text-foreground relative z-10 w-full flex flex-col items-center">
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

          <h2 className="text-2xl font-bold text-white mb-6">Your Previous Interviews</h2>
          {interviewsHistory.length === 0 ? (
            <p className="text-muted-foreground mb-12">You haven't taken any interviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {interviewsHistory.map((interview) => (
                <div key={interview._id} className="bg-[#0b0f19] border border-white/10 rounded-2xl p-5 hover:border-primary/50 transition-colors">
                  <h3 className="text-lg font-bold text-white mb-1">{interview.role}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs uppercase px-2 py-1 bg-white/5 rounded text-muted-foreground">{interview.mode} Mode</span>
                    <span className="text-xs text-muted-foreground">{new Date(interview.completedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Overall</p>
                      <p className="text-xl font-bold text-accent">{(interview.technicalScore + interview.communicationScore)/2}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-6">Take Mock Interviews</h2>
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

  // ─── 2. FEEDBACK VIEW ────────────────────────────────────────────────────────
  const renderFeedback = () => (
      <div className="py-12 container max-w-4xl relative z-10 text-foreground">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Evaluation Report: <span className="capitalize text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{report.role}</span>
        </h1>
        <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-blue-500/20 p-8 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
          {/* Decorative glowing orb */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
          
          <div className="flex flex-row justify-center gap-8 mb-8 border-b border-white/5 pb-8 relative z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">Overall Rating</span>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{(report.technicalScore + report.communicationScore)/2}</span>
                <span className="text-xl text-white/30 mb-1">/100</span>
              </div>
            </div>
            <div className="w-px bg-white/5" />
            <div className="flex flex-col items-center gap-1 justify-center">
               <span className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">Date</span>
               <span className="font-semibold text-white/90">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mb-10 relative z-10">
             <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
               <p className="text-lg leading-relaxed text-blue-50">{report.finalAssessment}</p>
             </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-widest text-xs">Skill Breakdown</h2>
            {report.categoryScores.map((cat: any, i: number) => (
              <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-blue-400 text-lg">{cat.name}</p>
                  <span className="bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full text-sm">{cat.score}/100</span>
                </div>
                <p className="text-muted-foreground/90">{cat.comment}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4 relative z-10">
             <Button className="flex-1 py-6 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10" onClick={() => setView('landing')}>
                Return to Dashboard
             </Button>
             <Button className="flex-1 py-6 rounded-full shadow-glow bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-bold" onClick={() => { setView('room'); handleRestart(); }}>
                Practice Again
             </Button>
          </div>
        </div>
      </div>
  );

  // ─── 3. INTERVIEW ROOM VIEW ──────────────────────────────────────────────────
  const renderRoom = () => (
    <div className="h-screen w-full flex flex-col items-center relative text-foreground overflow-hidden py-6">
      <div className="container max-w-6xl relative z-10 w-full flex-1 flex flex-col h-full">
        <div className="flex flex-shrink-0 items-center justify-between mb-4">
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
        <div className="flex-1 min-h-0 flex items-center justify-center relative w-full overflow-hidden">
          
          {/* Central Subtitle Pill - Only visible in Audio Mode */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-1/3">
             {isAudioMode && (
               <motion.div 
                 animate={{ scale: isAiSpeaking ? 1.05 : 1 }}
                 className="bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-full text-center shadow-2xl relative overflow-hidden"
               >
                 {isAiSpeaking && <div className="absolute inset-0 bg-primary/20 animate-pulse-slow"></div>}
                 <p className="text-lg font-medium text-white/90 relative z-10">{subtitle}</p>
               </motion.div>
             )}
          </div>

          <div className="flex w-full justify-center lg:px-20 relative z-10 gap-8 h-full">
            {isAudioMode ? (
              <>
                {/* AI Interviewer Node */}
                <motion.div 
                   animate={{ boxShadow: isAiSpeaking ? '0 0 50px rgba(124, 58, 237, 0.4)' : '0 0 0px transparent' }}
                   className="flex-1 max-w-sm h-full max-h-[480px] bg-[#0c0a1a] border border-primary/30 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                   <div className="absolute top-0 w-full h-1 bg-primary"></div>
                   <div className={`h-32 w-32 rounded-full bg-white flex items-center justify-center mb-6 shadow-glow relative ${isAiSpeaking ? 'animate-pulse' : ''}`}>
                      <Volume2 className="h-12 w-12 text-[#0c0a1a]" />
                   </div>
                   <h2 className="text-2xl font-bold tracking-wide text-white">AI Interviewer</h2>
                   <p className="text-primary mt-2 uppercase tracking-widest text-xs font-semibold">System Node Active</p>
                </motion.div>

                {/* User Node */}
                <div className="flex-1 max-w-sm h-full max-h-[480px] bg-[#0a0c10] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 relative group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                   <div className="absolute top-0 w-full h-1 bg-white/20"></div>
                   <div className="h-32 w-32 rounded-full bg-secondary border-4 border-[#0a0c10] flex items-center justify-center mb-6 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <UserIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                   </div>
                   <h2 className="text-2xl font-bold tracking-wide text-white">Sayali</h2>
                   <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs font-semibold">Candidate Node</p>
                </div>
              </>
            ) : (
              <div className="w-full max-w-4xl h-full flex flex-col relative z-30">
                {/* Chat Messages floating directly on the Background Grid */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground/60 text-lg">
                      {interviewStarted ? "Chat initialized. Awaiting input..." : "Click Start Interview below or start typing..."}
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'model' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-5 shadow-xl ${msg.role === 'model' ? 'bg-[#151923] border border-white/5 text-white/90' : 'bg-blue-600/90 text-white border border-blue-500/20'}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Pinned Bottom Chat Input */}
                <div className="w-full max-w-2xl mx-auto px-4 pb-4">
                  <div className="flex gap-3 bg-[#0a0c10]/95 backdrop-blur-md border border-white/10 rounded-full p-2 shadow-2xl items-center">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          if (!interviewStarted) setInterviewStarted(true);
                          handleSendChat();
                        }
                      }}
                      placeholder="Type your response here to auto-start..."
                      className="flex-1 bg-transparent px-6 py-3 text-sm text-white focus:outline-none placeholder:text-muted-foreground"
                    />
                    <Button 
                      onClick={() => {
                        if (!interviewStarted) setInterviewStarted(true);
                        handleSendChat();
                      }} 
                      disabled={!chatInput.trim()} 
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg mr-1 transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex-shrink-0 mt-4 flex justify-center gap-4 relative z-40 pb-2">
           {!interviewStarted ? (
             <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-glow rounded-full px-8 py-3 font-semibold text-sm transition-all hover:scale-105" onClick={toggleCall}>
               Start an Interview
             </Button>
           ) : (
             <>
               <Button variant="outline" className="rounded-full px-6 py-3 border-white/20 bg-black/40 text-white hover:bg-white/10 text-sm backdrop-blur-md transition-all" onClick={handleRestart}>
                 <RefreshCcw className="mr-2 h-4 w-4" /> Restart
               </Button>
               <Button className="rounded-full px-8 py-3 shadow-glow bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:scale-105" onClick={handleGenerateFeedback}>
                 Submit Interview
               </Button>
             </>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full relative flex">
      <BackgroundGrid />
      {view === 'landing' && renderLanding()}
      {view === 'feedback' && report && renderFeedback()}
      {view === 'room' && renderRoom()}
    </div>
  );
};

export default Interview;
