import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, IndianRupee, Clock, ChevronRight } from "lucide-react";

interface CareerCardProps {
  career: {
    id: string;
    name: string;
    description: string;
    fitScore: number;
    skills: string[];
    avgSalary: string;
    demand: "High" | "Medium" | "Low";
    timeToLearn: string;
  };
  onSelect: (id: string) => void;
  selected?: boolean;
}

const CareerCard = ({ career, onSelect, selected }: CareerCardProps) => {
  const demandColors = {
    High: "bg-success/10 text-success border-success/20",
    Medium: "bg-warning/10 text-warning border-warning/20",
    Low: "bg-muted text-muted-foreground border-muted",
  };

  return (
    <div
      className={`relative group bg-card rounded-xl border-2 p-6 transition-all duration-300 card-hover ${
        selected
          ? "border-primary shadow-glow"
          : "border-border hover:border-primary/50"
      }`}
    >
      {/* Fit Score Badge */}
      <div className="absolute -top-3 -right-3">
        <div className="relative">
          <div className="gradient-primary rounded-full p-0.5">
            <div className="bg-card rounded-full px-3 py-1">
              <span className="text-sm font-bold gradient-text">
                {career.fitScore}% match
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Career Info */}
      <h3 className="text-xl font-bold mb-2">{career.name}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {career.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {career.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs font-medium">
            {skill}
          </Badge>
        ))}
        {career.skills.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{career.skills.length - 3} more
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span className="font-medium">{career.avgSalary}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${demandColors[career.demand]}`}>
            {career.demand}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4 text-info" />
          <span className="font-medium">{career.timeToLearn}</span>
        </div>
      </div>

      {/* Select Button */}
      <Button
        variant={selected ? "hero" : "outline"}
        className="w-full group/btn"
        onClick={() => onSelect(career.id)}
      >
        {selected ? "Selected" : "Select Career"}
        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
      </Button>
    </div>
  );
};

export default CareerCard;
