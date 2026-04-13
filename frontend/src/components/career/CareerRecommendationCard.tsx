import { Card } from '@/components/ui/card';
import { CareerRecommendation } from '@/types/career';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Building2, GraduationCap } from 'lucide-react';

interface CareerRecommendationCardProps {
    career: CareerRecommendation;
    onSelect: (career: CareerRecommendation) => void;
    isSelected: boolean;
}

const CareerRecommendationCard = ({
    career,
    onSelect,
    isSelected,
}: CareerRecommendationCardProps) => {
    const domainColors = {
        technology: 'from-blue-500 to-cyan-500',
        design: 'from-purple-500 to-pink-500',
        business: 'from-green-500 to-teal-500',
        healthcare: 'from-red-500 to-orange-500',
    };

    const gradient = domainColors[career.domain];

    return (
        <Card
            className={`relative overflow-hidden transition-all duration-300 ${isSelected
                    ? 'ring-4 ring-primary shadow-2xl scale-105'
                    : 'hover:shadow-xl hover:scale-102'
                }`}
        >
            {/* Header with gradient */}
            <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 right-4">
                    {isSelected && (
                        <div className="bg-white rounded-full p-2">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                    )}
                </div>
                <div className="absolute bottom-4 left-6 text-white">
                    <h3 className="text-2xl font-bold">{career.name}</h3>
                    <p className="text-sm opacity-90 capitalize">{career.domain}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Fit Score */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                            Overall Fit Score
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            {career.fitScore.overall}%
                        </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                            style={{ width: `${career.fitScore.overall}%` }}
                        />
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="text-xs">
                            <span className="text-muted-foreground">Interest:</span>{' '}
                            <span className="font-semibold">
                                {career.fitScore.breakdown.interest}%
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-muted-foreground">Aptitude:</span>{' '}
                            <span className="font-semibold">
                                {career.fitScore.breakdown.aptitude}%
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-muted-foreground">Market:</span>{' '}
                            <span className="font-semibold">
                                {career.fitScore.breakdown.market}%
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-muted-foreground">Learning:</span>{' '}
                            <span className="font-semibold">
                                {career.fitScore.breakdown.learningStyle}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                    {career.description}
                </p>

                {/* Skills */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {career.requiredSkills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Market Outlook */}
                <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            Demand
                        </span>
                        <Badge
                            variant={
                                career.marketOutlook.demand === 'Very High'
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {career.marketOutlook.demand}
                        </Badge>
                    </div>

                    <div className="text-sm">
                        <span className="text-muted-foreground">Salary (Entry):</span>{' '}
                        <span className="font-semibold">
                            {career.marketOutlook.salaryRange.entry}
                        </span>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                        <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <span className="text-muted-foreground">Top Companies: </span>
                            <span className="font-medium">
                                {career.marketOutlook.topCompanies.slice(0, 3).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Select Button */}
                <Button
                    className="w-full mt-6"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelect(career)}
                >
                    {isSelected ? 'Selected' : 'Select This Career'}
                </Button>
            </div>
        </Card>
    );
};

export default CareerRecommendationCard;
