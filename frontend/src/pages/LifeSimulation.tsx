import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Battery, Brain, HeartPulse, Coins, Trophy, Calendar, CheckSquare, XSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LifeSimulation = () => {
  const [studyStreak, setStudyStreak] = useState(3);
  const [energy, setEnergy] = useState(85);
  const [stress, setStress] = useState(25);
  const [knowledge, setKnowledge] = useState(420);
  const [money, setMoney] = useState(1500);

  // State determines visuals
  const isDedicated = studyStreak >= 3;

  const tasks = [
    { id: 1, title: 'Complete Array Mastery', time: '10:00 AM', done: true },
    { id: 2, title: 'Mock Interview (Frontend)', time: '1:00 PM', done: false },
    { id: 3, title: 'Survive Escape Room', time: '4:00 PM', done: false },
  ];

  return (
    <div className={`min-h-screen pt-20 pb-12 transition-colors duration-1000 ${isDedicated ? 'bg-[#050510]' : 'bg-[#1a0b10]'}`}>
      <div className="container max-w-6xl relative z-10 text-foreground">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Life Simulation <span className="text-primary">Dashboard</span></h1>
            <p className="text-muted-foreground">Manage your reality. Level up your career.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setStudyStreak(0); setEnergy(30); setStress(80); }} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
              Simulate: Skip Study
            </Button>
            <Button variant="hero" onClick={() => { setStudyStreak(3); setEnergy(90); setStress(10); setKnowledge(k => k + 50); }} className="shadow-glow">
              Simulate: Deep Focus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Avatar & Environment (Left Column) */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              animate={{ borderColor: isDedicated ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 50, 50, 0.4)' }}
              className="w-full h-[600px] rounded-3xl border-2 backdrop-blur-md overflow-hidden relative shadow-2xl"
            >
              {/* Environment Background gradient */}
              <div className={`absolute inset-0 opacity-40 transition-colors duration-1000 ${isDedicated ? 'bg-gradient-to-tr from-primary/40 to-blue-500/20' : 'bg-gradient-to-tr from-red-900/60 to-orange-900/40'}`} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                 {/* Visual Avatar Placeholder */}
                 <motion.div 
                   animate={{ y: [0, -15, 0] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className={`w-48 h-48 rounded-full mb-8 border-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center text-7xl ${isDedicated ? 'border-primary bg-primary/10' : 'border-red-500 bg-red-500/10'}`}
                 >
                   {isDedicated ? '😎' : '😫'}
                 </motion.div>

                 <h2 className="text-2xl font-bold text-white mb-2">Sayali - Lvl 12</h2>
                 <p className={`font-semibold ${isDedicated ? 'text-primary' : 'text-red-400'}`}>
                   {isDedicated ? 'Focused & Thriving' : 'Stressed & Distracted'}
                 </p>
                 
                 <div className="mt-8 w-full p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                   <p className="text-sm text-left font-semibold text-white/50 uppercase tracking-widest mb-4">Environment Status</p>
                   <p className="text-md text-white/90 font-medium">
                     {isDedicated ? "Your room is clean, your mind is sharp. Opportunities multiply." : "Your desk is a mess. The bugs are multiplying. You need to focus."}
                   </p>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Stats & Tools (Right Column) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Core Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0b0f19] p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                <Brain className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-xs text-muted-foreground uppercase">Knowledge</p>
                <p className="text-xl font-bold text-white">{knowledge} EXP</p>
              </div>
              <div className="bg-[#0b0f19] p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                <Battery className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-xs text-muted-foreground uppercase">Energy</p>
                <div className="w-full bg-black/50 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${energy}%` }} />
                </div>
              </div>
              <div className="bg-[#0b0f19] p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                <HeartPulse className="w-6 h-6 text-red-400 mb-2" />
                <p className="text-xs text-muted-foreground uppercase">Stress</p>
                <div className="w-full bg-black/50 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${stress}%` }} />
                </div>
              </div>
              <div className="bg-[#0b0f19] p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                <Coins className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-xs text-muted-foreground uppercase">Credits</p>
                <p className="text-xl font-bold text-white">${money}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Daily Schedule */}
              <div className="bg-secondary/40 backdrop-blur-sm p-6 rounded-3xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="text-primary w-5 h-5"/> Daily Timeline
                </h3>
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task.done ? 'bg-primary shadow-[0_0_10px_#0ff]' : 'bg-white/20'}`} />
                        <span className={`font-semibold ${task.done ? 'text-white/80 line-through' : 'text-white'}`}>{task.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6 border-l pl-3 border-white/10 opacity-70 block py-1">{task.time}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Link to="/escape-room">
                      <Button variant="hero" className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                        Enter Escape Room Mode
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Career Progression Tree Placeholder */}
              <div className="bg-[#0a0f1c] p-6 rounded-3xl border border-primary/20 relative overflow-hidden shadow-glow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Trophy className="text-yellow-400 w-5 h-5"/> Career Tree
                </h3>
                
                <div className="relative z-10 flex flex-col gap-5">
                   <div className="p-3 bg-primary/20 border border-primary/30 rounded-xl relative shadow-glow-cyan text-center">
                      <p className="font-bold text-white">Software Engineer L1</p>
                      <span className="text-xs text-primary font-bold tracking-widest uppercase">Unlocked</span>
                   </div>
                   <div className="w-px h-6 bg-primary/50 mx-auto glow"></div>
                   <div className="p-3 bg-secondary/80 border border-white/10 rounded-xl relative text-center opacity-60 flex flex-col items-center">
                      <p className="font-bold text-white mb-1">Full Stack Developer</p>
                      <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                         Knowledge Required: 800 EXP
                      </span>
                   </div>
                   <div className="w-px h-6 bg-white/10 mx-auto"></div>
                   <div className="p-3 bg-secondary/40 border border-white/5 rounded-xl relative text-center opacity-40">
                      <p className="font-bold text-white">System Architect</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeSimulation;
