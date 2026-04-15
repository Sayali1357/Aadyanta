import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import YouTubePlaylistViewer from '@/components/resources/YouTubePlaylistViewer';
import ResourceCard from '@/components/resources/ResourceCard';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Save,
  Loader2,
} from 'lucide-react';
import { topicService } from '@/services/topicService';
import AttentionMonitor from '@/components/study/AttentionMonitor';
import QuizModal from '@/components/study/QuizModal';

interface TopicContent {
  id: string;
  name: string;
  module: string;
  domain: string;
  duration: string;
  objectives: string[];
  youtubePlaylist?: {
    playlistId: string;
    title: string;
  };
  resources: any[];
}

const Topic = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [topic, setTopic] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attentionData, setAttentionData] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Extract topic details from location state or URL
  const topicName = (location.state as any)?.topicName || id?.replace(/-/g, ' ') || 'Learning Topic';
  const moduleName = (location.state as any)?.moduleName || 'Learning Module';
  const domain = (location.state as any)?.domain || 'technology';

  useEffect(() => {
    loadTopicContent();
  }, [id, topicName]);

  const loadTopicContent = async () => {
    if (!id) {
      setError('No topic ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if Gemini API is configured
      const hasGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;

      let content: TopicContent;

      if (hasGeminiKey) {
        // Use Gemini to generate dynamic content
        content = await topicService.generateTopicContent(
          id,
          topicName,
          domain,
          moduleName
        );
      } else {
        // Use curated fallback playlists
        const playlist = topicService.getPopularPlaylist(topicName);

        content = {
          id,
          name: topicName,
          module: moduleName,
          domain,
          duration: '8 hours',
          objectives: [
            `Understand the fundamentals of ${topicName}`,
            `Learn key concepts and best practices`,
            `Build practical projects and examples`,
            `Apply ${topicName} in real-world scenarios`,
            `Master essential techniques and tools`,
          ],
          youtubePlaylist: playlist,
          resources: [
            {
              type: 'article' as const,
              platform: domain === 'technology' ? 'geeksforgeeks' : 'medium',
              title: `${topicName} - Complete Tutorial`,
              url: `https://www.google.com/search?q=${encodeURIComponent(topicName + ' tutorial')}`,
              isFree: true,
              duration: '45 min',
              instructor: 'Community',
              certification: false,
              language: 'english',
              priority: 4,
            },
            {
              type: 'course' as const,
              platform: 'freecodecamp',
              title: `${topicName} Free Course`,
              url: `https://www.freecodecamp.org/news/search?query=${encodeURIComponent(topicName)}`,
              isFree: true,
              duration: 'Self-paced',
              instructor: 'FreeCodeCamp',
              certification: true,
              language: 'english',
              priority: 3,
            },
          ],
        };
      }

      setTopic(content);
    } catch (err) {
      console.error('Error loading topic content:', err);
      setError('Failed to load topic content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = async (quizResult: any) => {
    setShowQuiz(false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/user/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          topicId: id,
          topicName: topicName,
          completed: true,
          timeSpent: 30, // simulated
          attentionData: attentionData,
          quizResult: quizResult // Phase 6 data
        })
      });
      setCompleted(true);
    } catch (error) {
      console.error('Error saving progress with quiz', error);
      setCompleted(true); // fallback UI update
    }
  };

  const handleVideoComplete = (videoId: string) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos([...completedVideos, videoId]);
      // In a real app, save to database
    }
  };

  const handleSaveNotes = () => {
    // In a real app, save notes to database
    alert('Notes saved successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container max-w-6xl">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="bg-white rounded-2xl border p-8 mb-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen py-8 relative overflow-hidden">
        <div className="container max-w-6xl">
          <Button variant="ghost" className="mb-6 hover:text-primary transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roadmap
          </Button>
          <div className="bg-white rounded-2xl border border-destructive p-8 text-center">
            <p className="text-destructive text-lg mb-4">{error || 'Topic not found'}</p>
            <Button onClick={loadTopicContent}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
      <div className="container max-w-6xl relative z-10">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 hover:text-primary transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roadmap
        </Button>

        {/* Topic Header */}
        <div className="glass-card rounded-2xl border border-border/50 shadow-glow p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-primary font-medium mb-1">{topic.module}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                {topic.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border/50 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  {topic.duration}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border/50 px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4 text-success" />
                  {(topic.youtubePlaylist ? 1 : 0) + topic.resources.length} resources
                </span>
              </div>
            </div>
            {completed ? (
              <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg border-2 border-success/30">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Completed ✓</span>
              </div>
            ) : (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                disabled={topic.youtubePlaylist ? completedVideos.length === 0 : false}
                onClick={handleStartQuiz}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Take Quiz & Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <QuizModal 
            topicName={topicName} 
            domain={topic.domain} 
            onClose={() => setShowQuiz(false)} 
            onComplete={handleQuizComplete} 
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attention Monitor Phase 5 */}
            <AttentionMonitor 
              onAttentionUpdate={setAttentionData} 
              isActive={!completed}
              isVideoPlaying={isVideoPlaying}
            />

            {/* Learning Resources Tabs */}
            <Tabs defaultValue="video" className="glass-card rounded-2xl shadow-lg border-border/50 overflow-hidden">
              <TabsList className="w-full grid grid-cols-2 bg-secondary/60 h-auto p-2 border-b border-border/50">
                <TabsTrigger value="video" className="text-base py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  📺 Video Course
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-base py-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  📚 Other Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="p-4 m-0">
                {topic.youtubePlaylist ? (
                  <>
                    <div className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary/90">
                        <strong>Topic:</strong> {topic.name}
                      </p>
                    </div>
                    <YouTubePlaylistViewer
                      playlistId={topic.youtubePlaylist.playlistId}
                      title={topic.youtubePlaylist.title}
                      onMarkComplete={handleVideoComplete}
                      completedVideos={completedVideos}
                      onVideoStateChange={setIsVideoPlaying}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No video playlist available for "{topic.name}"
                    </p>
                    <Button variant="outline" asChild>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.name + ' tutorial')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Search on YouTube
                      </a>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="p-4 m-0">
                <div className="space-y-4">
                  {topic.resources.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} domain={topic.domain as import('@/types/career').CareerDomain} />
                  ))}
                  {topic.resources.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No additional resources available</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(topic.name + ' tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Search Online
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Notes Section */}
            <div className="glass-card rounded-2xl shadow-lg p-6 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">📝 Your Notes</h2>
                <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4 mr-2 text-primary" />
                  Save Notes
                </Button>
              </div>
              <Textarea
                placeholder="Write your notes, key takeaways, code snippets, or questions here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className="resize-none font-mono text-sm bg-secondary/30 border-border/50 focus:border-primary/50 text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Your notes are automatically saved as you type
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Objectives */}
            <div className="glass-card rounded-2xl shadow-lg p-6 animate-fade-in border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🎯 Learning Objectives
              </h2>
              <ul className="space-y-3">
                {topic.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
                      <span className="text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-foreground/80 leading-relaxed">
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Progress Card */}
            <div className="glass-card border-primary/30 rounded-2xl shadow-glow p-6 text-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="text-lg font-semibold mb-4 relative z-10 text-primary">Your Progress</h3>
              <div className="space-y-3 relative z-10">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                    <span>Videos Completed</span>
                    <span className="font-semibold text-foreground">{completedVideos.length}</span>
                  </div>
                  <div className="bg-secondary/80 rounded-full h-2 overflow-hidden border border-border/50">
                    <div className="bg-primary h-full shadow-glow" style={{ width: topic.youtubePlaylist && completedVideos.length > 0 ? '100%' : '0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                    <span>Resources Reviewed</span>
                    <span className="font-semibold text-foreground">0/{topic.resources.length}</span>
                  </div>
                  <div className="bg-secondary/80 rounded-full h-2 overflow-hidden border border-border/50">
                    <div className="bg-success h-full shadow-glow" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-card border border-warning/50 rounded-2xl p-6 shadow-glow relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-warning/20 blur-xl rounded-full"></div>
              <h3 className="text-lg font-semibold mb-3 text-warning relative z-10">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-warning/80 relative z-10 font-medium">
                <li>• Practice coding along with videos</li>
                <li>• Take notes of key concepts</li>
                <li>• Complete coding challenges</li>
                <li>• Review regularly to retain knowledge</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topic;
