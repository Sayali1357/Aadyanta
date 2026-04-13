import { Card } from '@/components/ui/card';
import { DOMAIN_DISPLAY } from '@/config/careerDomains';
import { CareerDomain } from '@/types/career';

interface CareerDomainSelectorProps {
    onSelectDomain: (domain: CareerDomain) => void;
}

const CareerDomainSelector = ({ onSelectDomain }: CareerDomainSelectorProps) => {
    const domains = Object.entries(DOMAIN_DISPLAY);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Choose Your Career Domain
                </h1>
                <p className="text-lg text-muted-foreground">
                    Select a domain that interests you to discover career paths
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {domains.map(([domain, config]) => (
                    <Card
                        key={domain}
                        className={`p-8 cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br ${config.gradient} border-0 text-white group hover:shadow-2xl`}
                        onClick={() => onSelectDomain(domain as CareerDomain)}
                    >
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            {config.icon}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            {config.name}
                        </h3>

                        <p className="text-base opacity-90 mb-6">
                            {config.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {config.sampleCareers.slice(0, 3).map((career) => (
                                <span
                                    key={career}
                                    className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium"
                                >
                                    {career}
                                </span>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                    Not sure? Take our comprehensive assessment to find the best domain for you
                </p>
            </div>
        </div>
    );
};

export default CareerDomainSelector;
