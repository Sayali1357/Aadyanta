import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CareerDomainSelector from '@/components/career/CareerDomainSelector';
import { CareerDomain } from '@/types/career';
import { ArrowRight, Sparkles, Target, TrendingUp, Award } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showDomainSelector, setShowDomainSelector] = useState(false);

  const handleDomainSelect = (domain: CareerDomain) => {
    // Store selected domain and navigate to assessment
    localStorage.setItem('selectedDomain', domain);
    navigate('/assessment');
  };

  if (showDomainSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container py-8">
          <Button
            variant="outline"
            onClick={() => setShowDomainSelector(false)}
            className="mb-4"
          >
            ← Back
          </Button>
          <CareerDomainSelector onSelectDomain={handleDomainSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered Career Guidance</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Launch Your Dream Career
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered platform that helps you discover the perfect career path,
            build job-ready skills, and access curated free resources - all
            tailored for Indian students
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowDomainSelector(true)}
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/assessment')}
            >
              Take Assessment
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Career Paths</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-muted-foreground">Free Resources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">India</div>
              <div className="text-sm text-muted-foreground">Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Career Assessment</h3>
              <p className="text-muted-foreground">
                Take our comprehensive 15-question assessment powered by Google Gemini
                to discover careers that match your interests, aptitude, and goals
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Roadmaps</h3>
              <p className="text-muted-foreground">
                Get customized learning roadmaps with domain-specific resources:
                GFG for tech, Behance for design, and more
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-100">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with gamified progress tracking,
                streaks, and auto-generated portfolio from your skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Domains Preview */}
      <section className="container px-4 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Career Domains
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from technology, design, business, or healthcare paths
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-xl text-white">
              <div className="text-4xl mb-3">💻</div>
              <h3 className="text-xl font-bold mb-2">Technology</h3>
              <p className="text-sm opacity-90">
                Backend, Frontend, Data Science, ML & more
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-xl text-white">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-xl font-bold mb-2">Design</h3>
              <p className="text-sm opacity-90">
                UI/UX, Graphic Design, Product Design
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 p-6 rounded-xl text-white">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <p className="text-sm opacity-90">
                Product Manager, Analyst, Marketing
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-xl text-white">
              <div className="text-4xl mb-3">⚕️</div>
              <h3 className="text-xl font-bold mb-2">Healthcare</h3>
              <p className="text-sm opacity-90">
                Medical Coding, Health Analytics
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={() => setShowDomainSelector(true)}
            >
              Explore All Domains
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Take the Assessment</h3>
                <p className="text-muted-foreground">
                  Answer 15-20 questions about your interests, aptitude, skills, and goals.
                  Our AI analyzes your profile to recommend the best career matches.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Select Your Career</h3>
                <p className="text-muted-foreground">
                  Review recommended careers with detailed fit scores, market outlook,
                  and salary information. Choose the one that excites you most.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Follow Your Roadmap</h3>
                <p className="text-muted-foreground">
                  Get a personalized learning roadmap with curated free resources from
                  domain-specific platforms like GFG, YouTube, Coursera, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Track & Build</h3>
                <p className="text-muted-foreground">
                  Mark topics complete, track your progress, build your skills portfolio,
                  and export your resume when you're job-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Launch Your Career?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students discovering their perfect career path
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => navigate('/assessment')}
          >
            Start Your Journey Now
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
