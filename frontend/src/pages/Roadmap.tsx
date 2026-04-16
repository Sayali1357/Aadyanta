import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RoadmapTree from "@/components/roadmap/RoadmapTree";
import ProgressRing from "@/components/roadmap/ProgressRing";
import { ArrowLeft, Download, Share2, Clock, BookOpen, Trophy, Loader2, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";

interface Topic {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
}

interface Module {
  id: string;
  name: string;
  totalHours: number;
  topics: Topic[];
}

interface RoadmapData {
  title: string;
  description: string;
  totalHours: number;
  modules: Module[];
}

/** Pull modules from various API / proxy shapes */
function extractRawModules(data: Record<string, unknown>): unknown[] {
  const direct = data.modules;
  if (Array.isArray(direct) && direct.length > 0) return direct;

  const nested = data.roadmap;
  if (nested && typeof nested === "object" && Array.isArray((nested as { modules?: unknown[] }).modules)) {
    return (nested as { modules: unknown[] }).modules;
  }

  const inner = data.data;
  if (inner && typeof inner === "object") {
    const im = (inner as { modules?: unknown[] }).modules;
    if (Array.isArray(im) && im.length > 0) return im;
  }

  if (Array.isArray(direct)) return direct;
  return [];
}

const Roadmap = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = (await authService.getRoadmap(id)) as Record<string, unknown>;
        // Normalize backend response — API uses module_id, topic_id, career_name, estimated_hours
        const rawModules = extractRawModules(data);
        const modulesNorm: Module[] = rawModules.map((m: any, mi: number) => {
          const topics = (m.topics || []).map((t: any, ti: number) => ({
            id: String(
              t.topic_id ?? t.topicId ?? t.id ?? t.title ?? `${mi}-topic-${ti}`
            ),
            name: t.title ?? t.name ?? "Topic",
            hours: t.estimated_hours ?? t.estimatedHours ?? t.hours ?? 1,
            completed: Boolean(t.completed),
          }));
          const modHours =
            m.estimated_hours ??
            m.estimatedHours ??
            m.totalHours ??
            topics.reduce((a: number, t: Topic) => a + t.hours, 0);
          return {
            id: String(m.module_id ?? m.moduleId ?? m.id ?? m.title ?? `module-${mi}`),
            name: m.title ?? m.name ?? "Module",
            totalHours: modHours,
            topics,
          };
        });
        const sumHours = modulesNorm.reduce((acc, m) => acc + m.totalHours, 0);
        const normalized: RoadmapData = {
          title: String(data.career_name ?? data.careerName ?? data.title ?? id),
          description: String(
            data.description ??
              `Your personalized learning path for ${String(data.career_name ?? data.careerName ?? id)}`
          ),
          totalHours: Number(data.totalHours ?? data.estimatedHours ?? sumHours) || sumHours,
          modules: modulesNorm,
        };
        setRoadmap(normalized);
        setModules(normalized.modules);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roadmap");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  const handleTopicComplete = (moduleId: string, topicId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              topics: module.topics.map((topic) =>
                topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
              ),
            }
          : module
      )
    );
  };

  const handleTopicClick = (moduleId: string, topicId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    const topic = module?.topics.find((t) => t.id === topicId);
    navigate(`/topic/${topicId}`, {
      state: {
        topicName: topic?.name || topicId,
        moduleName: module?.name || 'Learning Module',
        domain: 'technology',
      },
    });
  };

  const handleQuizClick = (moduleId: string, moduleName: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      navigate(`/quiz/${id}/${moduleId}`, {
        state: { moduleName: module.name, topics: module.topics },
      });
    } else {
      navigate(`/quiz/${id}/${moduleId}`);
    }
  };

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).length,
    0
  );
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const completedHours = modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).reduce((h, t) => h + t.hours, 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#8B7CFF' }} />
          <p style={{ color: '#A0A3B1' }}>Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-lg font-semibold" style={{ color: '#EAEAF0' }}>
            {error || "Roadmap not found"}
          </p>
          <p style={{ color: '#A0A3B1' }} className="text-sm">
            Complete the Career Assessment first to generate your personalized roadmap.
          </p>
          <Button onClick={() => navigate('/assessment')}
            style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff', border: 'none' }}>
            Go to Career Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}
          style={{ color: '#A0A3B1' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header Card */}
        <div className="rounded-2xl p-6 md:p-8 mb-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#EAEAF0' }}>
                {roadmap.title} Roadmap
              </h1>
              <p className="mb-4" style={{ color: '#A0A3B1' }}>{roadmap.description}</p>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(139,124,255,0.1)', color: '#B69CFF' }}>
                  <Clock className="h-4 w-4" />
                  <span>{completedHours}/{roadmap.totalHours}h</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                  <BookOpen className="h-4 w-4" />
                  <span>{completedTopics}/{totalTopics} topics</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>
                  <Trophy className="h-4 w-4" />
                  <span>{modules.length} modules</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress} size={100} strokeWidth={8} />
              <p className="text-sm mt-2" style={{ color: '#A0A3B1' }}>Overall Progress</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Button variant="outline" size="sm"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#A0A3B1' }}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#A0A3B1' }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Roadmap Tree */}
        {modules.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="font-medium mb-2" style={{ color: "#EAEAF0" }}>
              No modules in this roadmap yet
            </p>
            <p className="text-sm mb-4" style={{ color: "#6B6F7A" }}>
              The API returned a roadmap without modules. Re-run{" "}
              <code className="text-xs px-1 rounded bg-white/5">npm run seed</code> in the repo root, or
              regenerate the roadmap from the backend.
            </p>
          </div>
        ) : (
          <RoadmapTree
            modules={modules}
            onTopicComplete={handleTopicComplete}
            onTopicClick={handleTopicClick}
            onQuizClick={handleQuizClick}
          />
        )}
      </div>
    </div>
  );
};

export default Roadmap;
