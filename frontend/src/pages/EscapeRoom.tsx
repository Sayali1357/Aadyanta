import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, AlertTriangle, Shield, Zap, ChevronRight, Heart, XCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EscapeRoom = () => {
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  
  // New State variables for mechanics
  const [lives, setLives] = useState(3);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const currentProblem = {
    title: "The Locked Cyber-Gate",
    description: "Write a function to return the Nth number in the Fibonacci sequence to bypass the lock mechanism. The recursive nature of this sequence is the only way to unlock the cryptographic seal on the door.",
    correctAnswer: "fibonacci",
    hint: "Think about recursion: f(n) = f(n-1) + f(n-2). Base cases are 0 and 1."
  };

  useEffect(() => {
    if (gameOver || doorUnlocked || showJumpscare) return;
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [gameOver, doorUnlocked, showJumpscare]);

  useEffect(() => {
    if (timeLeft === 0) setGameOver(true);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    if (doorUnlocked || gameOver) return;
    const answer = userAnswer.toLowerCase();
    
    if (answer.includes(currentProblem.correctAnswer)) {
      setDoorUnlocked(true);
    } else {
      // Trigger Monster Jumpscare
      setShowJumpscare(true);
      
      setTimeout(() => {
        setShowJumpscare(false);
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
             setGameOver(true);
          }
          return newLives;
        });
      }, 3500); // Show monster for 3.5 seconds
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205] text-foreground flex flex-col font-sans overflow-hidden">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#020205] to-black" />
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Header HUD */}
      <div className="relative z-10 w-full p-4 flex justify-between items-center border-b border-white/5 bg-[#0a0a0f]">
        <div className="flex items-center gap-6">
          <Link to="/dashboard">
             <Button variant="ghost" className="text-muted-foreground hover:text-white border border-white/10 rounded-full px-6">
                Abort Mission
             </Button>
          </Link>
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
               <Heart 
                 key={i} 
                 className={`w-6 h-6 transition-all duration-500 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'text-white/20'}`} 
               />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
           {doorUnlocked && <span className="text-green-500 font-bold uppercase tracking-widest text-sm animate-pulse">Gate Defaulted</span>}
           <div className={`px-6 py-2 rounded-xl border flex items-center gap-3 font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-[#0d121f] border-primary/50 text-primary'}`}>
             <Clock className="w-5 h-5" />
             {formatTime(timeLeft)}
           </div>
        </div>
      </div>

      {/* LeetCode Style Split Layout */}
      <div className="flex-1 relative z-10 flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-80px)]">
        
        {/* Left Side: Problem Statement */}
        <div className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl flex flex-col relative overflow-hidden">
           <div className="bg-black/40 border-b border-white/5 py-3 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-mono text-sm font-bold uppercase tracking-widest">
                 <Terminal className="w-4 h-4" /> System Directive
              </div>
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full uppercase font-bold">Hard</span>
           </div>
           
           <div className="p-8 flex-1 overflow-y-auto">
              <h2 className="text-3xl font-bold text-white mb-6">{currentProblem.title}</h2>
              <div className="prose prose-invert max-w-none">
                 <p className="text-lg text-white/80 leading-relaxed mb-6">
                    {currentProblem.description}
                 </p>
                 <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8 font-mono text-sm text-blue-300">
                    <p className="mb-2"><strong>Input:</strong> n = 4</p>
                    <p className="mb-2"><strong>Output:</strong> 3</p>
                    <p><strong>Explanation:</strong> F(4) = F(3) + F(2) = 2 + 1 = 3.</p>
                 </div>
                 
                 <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl flex gap-3 text-yellow-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                       <strong className="block mb-1">Warning</strong>
                       Entering the wrong decryption sequence will trigger the facility's localized defense matrix...
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="flex-1 lg:max-w-3xl flex flex-col">
          <div className="bg-[#0b0f19] border border-white/10 rounded-xl flex-1 flex flex-col relative overflow-hidden">
            
            <div className="bg-[#1e1e1e] border-b border-white/5 py-2 px-4 flex items-center gap-2">
               <div className="bg-[#2d2d2d] text-white/80 px-4 py-2 text-sm rounded-t-md font-mono border-t border-l border-r border-[#333]">
                 solution.js
               </div>
            </div>

            <div className="flex-1 relative bg-[#1e1e1e] flex flex-col">
               {/* Line numbers fake gutter */}
               <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col text-right pr-2 pt-4 text-[#858585] font-mono text-sm select-none">
                  {[...Array(20)].map((_, i) => <div key={i} className="mb-1">{i+1}</div>)}
               </div>
               
               <textarea 
                 value={userAnswer}
                 onChange={(e) => setUserAnswer(e.target.value)}
                 className="flex-1 bg-transparent pl-16 pr-4 pt-4 pb-4 text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none leading-relaxed tracking-wide"
                 placeholder={`/**\n * @param {number} n\n * @return {number}\n */\nvar fib = function(n) {\n    // Code here...\n};`}
                 disabled={doorUnlocked || gameOver}
                 spellCheck={false}
                 style={{ tabSize: 4 }}
               />
            </div>

            <div className="bg-[#1e1e1e] border-t border-[#333] p-4 flex justify-between items-center">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" disabled={doorUnlocked || gameOver}>
                Get Hint (Cost: 1 min)
              </Button>
              <Button 
                 variant="hero" 
                 size="lg"
                 className={`shadow-glow px-12 ${doorUnlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`} 
                 onClick={handleRunCode} 
                 disabled={doorUnlocked || gameOver}
              >
                {doorUnlocked ? <><Unlock className="w-5 h-5 mr-2"/> Passed</> : <><Zap className="w-5 h-5 mr-2" /> Submit Code</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BIG SCARY MONSTER FULL SCREEN JUMPSCARE OVERLAY */}
      <AnimatePresence>
        {showJumpscare && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ type: "spring", damping: 10, stiffness: 50 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Rapid flashing background */}
            <motion.div 
              animate={{ opacity: [0, 1, 0, 1, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="absolute inset-0 bg-red-900 mix-blend-screen pointer-events-none" 
            />
            
            {/* The Monster Graphic */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1, 1.3, 1.1],
                rotate: [-5, 5, -10, 10, 0],
                y: [0, -50, 50, -20, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="relative z-10"
            >
               {/* Massive CSS rendered monster */}
               <div className="text-[25rem] filter drop-shadow-[0_0_100px_rgba(255,0,0,1)] select-none">
                 👹
               </div>
            </motion.div>

            {/* Screaming Text */}
            <motion.div 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-20 z-20 text-center"
            >
               <h1 className="text-8xl font-black text-red-600 uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,0,0,1)] font-mono">
                  SYNTAX ERROR
               </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER SCREEN */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <XCircle className="w-32 h-32 text-red-500 mb-8 drop-shadow-[0_0_50px_rgba(255,0,0,0.8)]" />
            <h1 className="text-6xl font-black text-white mb-4 tracking-widest uppercase">You Died</h1>
            <p className="text-xl text-red-200 mb-12">The syntax beast consumed your code. Facility locked down.</p>
            
            <div className="flex gap-6">
               <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="border-white/20 bg-black hover:bg-white/10 px-8 py-6 text-xl">
                 Try Again
               </Button>
               <Link to="/dashboard">
                 <Button variant="hero" size="lg" className="px-8 py-6 text-xl bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(255,0,0,0.5)] border-none">
                   Return to Base
                 </Button>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS WIN SCREEN */}
      <AnimatePresence>
        {doorUnlocked && !showJumpscare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] bg-[#051510]/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <Unlock className="w-32 h-32 text-green-400 mb-8 drop-shadow-[0_0_50px_rgba(0,255,0,0.8)]" />
            <h1 className="text-6xl font-black text-white mb-4 tracking-widest uppercase">Sector Unlocked</h1>
            <p className="text-xl text-green-200 mb-12 font-mono">Algorithms accepted. You survived this room.</p>
            
            <div className="flex gap-6">
               <Link to="/dashboard">
                 <Button variant="hero" size="lg" className="px-12 py-6 text-xl shadow-[0_0_30px_rgba(0,255,0,0.4)]">
                   Continue Journey
                 </Button>
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EscapeRoom;
