import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, Focus, Activity, Play, Square, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AttentionSession {
  sessionId: string;
  currentScore: number;
  framesProcessed: number;
  elapsedTime: number;
  status: 'ATTENTIVE' | 'DISTRACTED';
  timeArray: number[];
  attentionArray: number[];
  statusArray: string[];
  faceDetected: boolean;
}

interface AttentionMonitorProps {
  isVideoPlaying?: boolean;
  onAttentionUpdate?: (data: any) => void;
  isActive?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AttentionMonitor: React.FC<AttentionMonitorProps> = ({ 
  isVideoPlaying = false,
  onAttentionUpdate,
  isActive = true 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<AttentionSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  // Start monitoring session
  const startMonitoring = useCallback(async () => {
    try {
      setModelError(null);
      const response = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeout: 300 })
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Attention model server is offline. Please ensure the backend is running.');
        }
        throw new Error('Failed to start attention monitoring session');
      }

      const data = await response.json();
      const newSessionData: AttentionSession = {
        sessionId: data.session_id,
        currentScore: 0,
        framesProcessed: 0,
        elapsedTime: 0,
        status: 'ATTENTIVE',
        timeArray: [],
        attentionArray: [],
        statusArray: [],
        faceDetected: false
      };
      
      setSessionData(newSessionData);
      setIsMonitoring(true);
      sendSnapshots(data.session_id);
    } catch (error) {
      setModelError(error instanceof Error ? error.message : 'Failed to start monitoring');
      console.error('Error starting monitoring:', error);
    }
  }, []);

  // Stop monitoring session
  const stopMonitoring = useCallback(async () => {
    try {
      if (!sessionData?.sessionId) return;

      setIsMonitoring(false);
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }

      // Get final summary
      const summaryResponse = await fetch(`${API_BASE}/session/${sessionData.sessionId}/summary`);
      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setSessionSummary(summary);
        setShowResults(true);
      }

      // End session
      await fetch(`${API_BASE}/session/${sessionData.sessionId}/end`, {
        method: 'POST'
      });

      setSessionData(null);
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      setModelError('Error ending session');
    }
  }, [sessionData?.sessionId]);

  // Send snapshots to backend
  const sendSnapshots = useCallback((sessionId: string) => {
    snapshotIntervalRef.current = setInterval(async () => {
      if (!isMonitoring || !videoRef.current || !canvasRef.current) {
        return;
      }

      try {
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;

          const formData = new FormData();
          formData.append('image', blob, 'snapshot.jpg');

          const response = await fetch(`${API_BASE}/session/${sessionId}/snapshot`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            if (response.status === 503) {
              setModelError('Model server is offline');
              stopMonitoring();
              return;
            }
            throw new Error('Failed to process snapshot');
          }

          const data = await response.json();
          
          setSessionData(prev => prev ? {
            ...prev,
            currentScore: data.attention_score,
            framesProcessed: data.frames_processed,
            elapsedTime: data.elapsed_time,
            status: data.current_status,
            faceDetected: data.face_detected
          } : null);

          if (onAttentionUpdate) {
            onAttentionUpdate({
              score: Math.round(data.attention_score),
              attention_score: data.attention_score
            });
          }
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('Error sending snapshot:', error);
      }
    }, 300); // Send every 300ms
  }, [isMonitoring, onAttentionUpdate, stopMonitoring]);

  // Auto-start monitoring when video plays
  useEffect(() => {
    if (isVideoPlaying && isActive && !isMonitoring && isCameraActive && !permissionDenied) {
      startMonitoring();
    } else if (!isVideoPlaying && isMonitoring) {
      stopMonitoring();
    }
  }, [isVideoPlaying, isActive, isCameraActive, permissionDenied, startMonitoring, stopMonitoring, isMonitoring]);

  // Initialize camera on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        setStream(mediaStream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setPermissionDenied(true);
        setModelError('Camera access denied. Please allow camera access in browser settings.');
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
    <Card className="overflow-hidden shadow-lg border border-slate-200">
      {/* Error Alert */}
      {modelError && (
        <Alert className="rounded-none border-b border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{modelError}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <h3 className="font-semibold text-sm">AI Attention Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {isMonitoring && (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="text-xs font-medium">Monitoring</span>
            </>
          )}
          {!isMonitoring && isCameraActive && (
            <>
              <Camera className="h-4 w-4" />
              <span className="text-xs font-medium">Ready</span>
            </>
          )}
          {permissionDenied && (
            <>
              <CameraOff className="h-4 w-4" />
              <span className="text-xs font-medium">No Camera</span>
            </>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Camera Feed & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Camera */}
          <div className="md:col-span-2">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-slate-300">
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center h-full">
                  <Camera className="h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">
                    {permissionDenied ? 'Camera access denied' : 'Initializing camera...'}
                  </p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="space-y-3">
            {/* Attention Score */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Focus className="h-3 w-3" />
                Attention Score
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {sessionData ? Math.round(sessionData.currentScore) : '--'}%
              </div>
              <div className="mt-2">
                <Progress 
                  value={sessionData?.currentScore || 0} 
                  className="h-1.5"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-2">Status</div>
              {sessionData && (
                <Badge className={sessionData.status === 'ATTENTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {sessionData.status}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-2 text-center">
                <div className="text-xs text-slate-600">Frames</div>
                <div className="font-bold text-slate-900">{sessionData?.framesProcessed || 0}</div>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-2 text-center">
                <div className="text-xs text-slate-600">Time</div>
                <div className="font-bold text-slate-900">{sessionData?.elapsedTime.toFixed(1)}s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Show Results Summary */}
        {showResults && sessionSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Session Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Final Score</span>
                <div className="font-bold text-lg text-purple-600">{Math.round(sessionSummary.attention_score)}%</div>
              </div>
              <div>
                <span className="text-slate-600">Total Time</span>
                <div className="font-bold text-lg text-slate-900">{sessionSummary.total_time.toFixed(1)}s</div>
              </div>
              <div>
                <span className="text-slate-600">Total Frames</span>
                <div className="font-bold text-slate-900">{sessionSummary.frames_processed}</div>
              </div>
              <div>
                <span className="text-slate-600">Distracted Periods</span>
                <div className="font-bold text-slate-900">{sessionSummary.distracted_periods?.length || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!sessionData && !isMonitoring && isCameraActive && !modelError && (
          <div className="text-center py-4 text-slate-600 text-sm">
            <p>Play a YouTube video to automatically start attention monitoring</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttentionMonitor;
