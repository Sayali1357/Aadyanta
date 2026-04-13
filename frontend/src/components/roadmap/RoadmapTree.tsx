import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, BookOpen } from "lucide-react";
import ProgressRing from "./ProgressRing";
import { cn } from "@/lib/utils";

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
}

const RoadmapTree = ({ modules, onTopicComplete, onTopicClick }: RoadmapTreeProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.topics.filter((t) => t.completed).length;
    return Math.round((completed / module.topics.length) * 100);
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
            className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in"
            style={{ animationDelay: `${moduleIndex * 100}ms` }}
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                {moduleIndex + 1}
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">{module.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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

              <div className="text-muted-foreground">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Topics List */}
            {isExpanded && (
              <div className="border-t border-border bg-secondary/20">
                {module.topics.map((topic, topicIndex) => (
                  <div
                    key={topic.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 pl-16 group transition-colors cursor-pointer",
                      topic.completed
                        ? "bg-success/5"
                        : "hover:bg-secondary/50",
                      topicIndex !== module.topics.length - 1 && "border-b border-border/50"
                    )}
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
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </button>

                    {/* Topic Name */}
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        topic.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {topic.name}
                    </span>

                    {/* Hours Badge */}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {topic.hours}h
                    </span>

                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapTree;
