import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle, Focus, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AttentionData {
  score: number;
  distractions: number;
  emotions: {
    focused: number;
    bored: number;
    confused: number;
  };
}

interface AttentionMonitorProps {
  onAttentionUpdate: (data: AttentionData) => void;
  isActive?: boolean;
}

const AttentionMonitor: React.FC<AttentionMonitorProps> = ({ onAttentionUpdate, isActive = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [attentionData, setAttentionData] = useState<AttentionData>({
    score: 85,
    distractions: 0,
    emotions: { focused: 80, bored: 10, confused: 10 }
  });

  const generateSimulatedData = (prev: AttentionData): AttentionData => {
    // Simulate AI model outputs (Focus, Distraction, Emotions)
    const newScore = Math.min(100, Math.max(30, prev.score + (Math.random() * 10 - 5)));
    const newDistraction = Math.random() > 0.95 ? prev.distractions + 1 : prev.distractions;
    
    return {
      score: Math.round(newScore),
      distractions: newDistraction,
      emotions: {
        focused: Math.min(100, Math.round(newScore * 0.9)),
        bored: Math.max(0, Math.round(100 - newScore - (Math.random() * 10))),
        confused: Math.max(0, Math.round((100 - newScore) * 0.3)),
      }
    };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCameraActive && isActive) {
      interval = setInterval(() => {
        setAttentionData((prev) => {
          const newData = generateSimulatedData(prev);
          onAttentionUpdate(newData); // send data to parent
          return newData;
        });
      }, 3000); // 3 seconds for simulation update
    }

    return () => {
      clearInterval(interval);
    };
  }, [isCameraActive, isActive, onAttentionUpdate]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setPermissionDenied(true);
        console.error('Error accessing webcam:', err);
      }
    };

    if (isActive && !stream && !permissionDenied) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, permissionDenied]);

  if (!isActive) return null;

  return (
    <Card className="bg-slate-900 border-slate-700 text-slate-100 overflow-hidden shadow-xl animate-fade-in">
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Attention Monitor</h3>
        </div>
        {isCameraActive ? (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-400 font-medium">Tracking Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CameraOff className="h-4 w-4 text-red-400" />
            <span className="text-xs text-red-400 font-medium">{permissionDenied ? 'Access Denied' : 'Inactive'}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-slate-700 flex items-center justify-center">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover opacity-80"
                />
                {/* Simulated AI Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-primary/50 border-dashed rounded-lg">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary -mb-1 -mr-1"></div>
                  </div>
                  {/* Fake face landmarks */}
                  <div className="absolute top-[40%] left-[45%] w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,1)]"></div>
                  <div className="absolute top-[40%] right-[45%] w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,1)]"></div>
                  <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-8 h-1 bg-green-400/50 rounded-full"></div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                {permissionDenied ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Camera access is blocked.</p>
                  </>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-slate-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-slate-400">Initializing camera...</p>
                  </>
                )}
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white">
              Model: v2.4.1 (CV)
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1"><Focus className="h-3 w-3"/> Attention Score</span>
                <span className={attentionData.score > 70 ? 'text-green-400 font-bold' : attentionData.score > 40 ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
                  {attentionData.score}%
                </span>
              </div>
              <Progress value={attentionData.score} className="h-2 bg-slate-800" indicatorclassName={attentionData.score > 70 ? 'bg-green-500' : attentionData.score > 40 ? 'bg-yellow-500' : 'bg-red-500'} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-800 rounded p-2 border border-slate-700">
                <div className="text-slate-400 mb-1">Distractions</div>
                <div className="text-lg font-bold text-white">{attentionData.distractions}</div>
              </div>
              <div className="bg-slate-800 rounded p-2 border border-slate-700">
                <div className="text-slate-400 mb-1">Primary Emotion</div>
                <div className="text-lg font-bold text-primary">
                  {attentionData.emotions.focused > Math.max(attentionData.emotions.bored, attentionData.emotions.confused) ? 'Focused' : 
                   (attentionData.emotions.bored > attentionData.emotions.confused ? 'Bored' : 'Confused')}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">Emotion Analysis</div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Focused</span>
                <span className="text-slate-300">{attentionData.emotions.focused}%</span>
              </div>
              <Progress value={attentionData.emotions.focused} className="h-1 bg-slate-800" indicatorclassName="bg-blue-400" />
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">Bored</span>
                <span className="text-slate-300">{attentionData.emotions.bored}%</span>
              </div>
              <Progress value={attentionData.emotions.bored} className="h-1 bg-slate-800" indicatorclassName="bg-slate-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionMonitor;
