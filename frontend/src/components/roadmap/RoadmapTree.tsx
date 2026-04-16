import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, BookOpen, BrainCircuit } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
  resources?: { type: string; title: string; url: string }[];
}

interface Module {
  id: string;
  name: string;
  topics: Topic[];
  totalHours: number;
}

interface RoadmapTreeProps {
  modules: Module[];
  onTopicComplete: (moduleId: string, topicId: string) => void;
  onTopicClick: (moduleId: string, topicId: string) => void;
  onQuizClick?: (moduleId: string, moduleName: string) => void;
}

const RoadmapTree = ({ modules, onTopicComplete, onTopicClick, onQuizClick }: RoadmapTreeProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Expand first module when modules load (initial state only runs once — was stuck empty before)
  useEffect(() => {
    if (modules.length === 0) {
      setExpandedModules([]);
      return;
    }
    const firstId = modules[0].id;
    setExpandedModules((prev) => {
      if (prev.length === 0) return [firstId];
      const stillValid = prev.filter((id) => modules.some((m) => m.id === id));
      if (stillValid.length > 0) return stillValid;
      return [firstId];
    });
  }, [modules]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (module: Module) => {
    const n = module.topics.length;
    if (n === 0) return 0;
    const completed = module.topics.filter((t) => t.completed).length;
    return Math.round((completed / n) * 100);
  };

  const getCompletedHours = (module: Module) => {
    return module.topics
      .filter((t) => t.completed)
      .reduce((acc, t) => acc + t.hours, 0);
  };

  return (
    <div className="space-y-3">
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.includes(module.id);
        const progress = getModuleProgress(module);
        const completedHours = getCompletedHours(module);

        return (
          <div
            key={module.id}
            className="rounded-xl overflow-hidden animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              animationDelay: `${moduleIndex * 100}ms`,
            }}
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center gap-4 p-4 transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm"
                style={{ background: 'rgba(139,124,255,0.15)', color: '#8B7CFF' }}>
                {moduleIndex + 1}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold" style={{ color: '#EAEAF0' }}>{module.name}</h3>
                <div className="flex items-center gap-3 text-xs mt-1" style={{ color: '#6B6F7A' }}>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {completedHours}/{module.totalHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {module.topics.filter((t) => t.completed).length}/{module.topics.length} topics
                  </span>
                </div>
              </div>

              <ProgressRing progress={progress} size={40} strokeWidth={3} />

              <div style={{ color: '#6B6F7A' }}>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Topics List */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                {module.topics.map((topic, topicIndex) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-3 px-4 py-3 pl-16 group cursor-pointer transition-colors"
                    style={{
                      background: topic.completed ? 'rgba(52,211,153,0.04)' : 'transparent',
                      borderBottom: topicIndex !== module.topics.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                    onMouseEnter={e => { if (!topic.completed) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = topic.completed ? 'rgba(52,211,153,0.04)' : 'transparent'; }}
                    onClick={() => onTopicClick(module.id, topic.id)}
                  >
                    {/* Completion Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTopicComplete(module.id, topic.id);
                      }}
                      className="flex-shrink-0"
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#34D399' }} />
                      ) : (
                        <Circle className="h-5 w-5 transition-colors" style={{ color: '#6B6F7A' }} />
                      )}
                    </button>

                    {/* Topic Name */}
                    <span className="flex-1 text-sm"
                      style={{ color: topic.completed ? '#6B6F7A' : '#EAEAF0',
                        textDecoration: topic.completed ? 'line-through' : 'none' }}>
                      {topic.name}
                    </span>

                    {/* Hours Badge */}
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#6B6F7A' }}>
                      {topic.hours}h
                    </span>

                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#6B6F7A' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Take Module Quiz Button */}
            {onQuizClick && (
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(139,124,255,0.04)' }}>
                <span className="text-xs" style={{ color: '#6B6F7A' }}>
                  Test your knowledge for this module
                </span>
                <Button
                  size="sm"
                  className="gap-2"
                  style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff', border: 'none' }}
                  onClick={() => onQuizClick(module.id, module.name)}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Take Module Quiz
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapTree;
