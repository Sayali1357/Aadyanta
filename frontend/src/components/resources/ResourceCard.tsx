import { Resource, CareerDomain } from "@/types/career";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Video,
    ExternalLink,
    Clock,
    Award,
    ChevronRight,
    FileText,
    MousePointerClick,
    MonitorPlay
} from "lucide-react";

interface ResourceCardProps {
    resource: Resource;
    domain: CareerDomain;
}

const ResourceCard = ({ resource, domain }: ResourceCardProps) => {
    const getIcon = (type: Resource['type']) => {
        switch (type) {
            case 'video': return <Video className="h-5 w-5" />;
            case 'course': return <MonitorPlay className="h-5 w-5" />;
            case 'article': return <FileText className="h-5 w-5" />;
            case 'notes': return <BookOpen className="h-5 w-5" />;
            case 'interactive': return <MousePointerClick className="h-5 w-5" />;
            case 'practice': return <Award className="h-5 w-5" />;
            default: return <ExternalLink className="h-5 w-5" />;
        }
    };

    const getPlatformColors = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('geeksforgeeks')) return "text-green-600 bg-green-50 border-green-200";
        if (p.includes('freecodecamp')) return "text-blue-600 bg-blue-50 border-blue-200";
        if (p.includes('youtube')) return "text-red-600 bg-red-50 border-red-200";
        if (p.includes('medium')) return "text-gray-900 bg-gray-50 border-gray-200";
        if (p.includes('coursera')) return "text-blue-700 bg-blue-50 border-blue-200";
        return "text-muted-foreground bg-muted border-border";
    };

    return (
        <div className="group relative bg-white rounded-xl border border-border p-5 transition-all duration-300 hover:shadow-xl hover:border-primary/50 animate-slide-up">
            <div className="flex flex-col md:flex-row gap-5">
                {/* Left Side: Icon and Type */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform duration-300">
                        {getIcon(resource.type)}
                    </div>
                </div>

                {/* Middle: Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getPlatformColors(resource.platform)}`}>
                            {resource.platform}
                        </span>
                        {resource.isFree && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-success border-success/30 bg-success/5">
                                Free
                            </Badge>
                        )}
                        {resource.certification && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-info border-info/30 bg-info/5">
                                Certificate
                            </Badge>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {resource.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {resource.instructor && (
                            <span className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground/70">Instructor:</span> {resource.instructor}
                            </span>
                        )}
                        {resource.duration && (
                            <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                {resource.duration}
                            </span>
                        )}
                        {resource.language && (
                            <span className="flex items-center gap-1.5 capitalize font-medium">
                                <BookOpen className="h-3.5 w-3.5" />
                                {resource.language}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Side: Action */}
                <div className="flex flex-col justify-center items-end gap-2">
                    <Button
                        asChild
                        className="rounded-full px-6 group/btn bg-primary hover:bg-primary-hover shadow-glow-sm"
                    >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            Go to Resource
                            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
