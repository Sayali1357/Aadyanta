import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CareerDomainSelector from '@/components/career/CareerDomainSelector';
import { CareerDomain } from '@/types/career';
import { ArrowRight, Sparkles, Target, TrendingUp, Award, Zap, Star, Globe } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showDomainSelector, setShowDomainSelector] = useState(false);

  const handleDomainSelect = (domain: CareerDomain) => {
    localStorage.setItem('selectedDomain', domain);
    navigate('/assessment');
  };

  if (showDomainSelector) {
    return (
      <div className="min-h-screen relative z-10">
        <div className="container py-8">
          <Button
            variant="outline"
            onClick={() => setShowDomainSelector(false)}
            className="mb-4"
            style={{ borderColor: 'rgba(139,124,255,0.3)', color: '#B69CFF' }}
          >
            ← Back
          </Button>
          <CareerDomainSelector onSelectDomain={handleDomainSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative z-10">

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #8B7CFF 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #00E5FF 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-[40%] left-[-5%] w-[400px] h-[300px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse, #FFB199 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Hero Section */}
      <section className="relative container px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
            style={{ background: 'rgba(139,124,255,0.08)', border: '1px solid rgba(139,124,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#8B7CFF' }} />
            <span className="text-sm font-semibold" style={{ color: '#B69CFF' }}>AI-Powered Career Guidance</span>
            <Zap className="w-3 h-3" style={{ color: '#00E5FF' }} />
          </div>

          {/* Headline — gradient text with Sora */}
          <h1 className="text-5xl md:text-7xl mb-6 leading-tight animate-slide-up"
            style={{
              fontFamily: 'Sora, Inter, sans-serif',
              background: 'linear-gradient(135deg, #EAEAF0 0%, #B69CFF 40%, #00E5FF 70%, #8B7CFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            LAUNCH YOUR<br />DREAM CAREER
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ color: '#A0A3B1' }}>
            AI-powered platform that helps you discover the perfect career path,
            build job-ready skills, and access curated free resources — all
            tailored for Indian students.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 font-semibold animate-glow-pulse text-white"
              style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                border: 'none',
                boxShadow: '0 0 30px -5px rgba(139,124,255,0.6)',
              }}
              onClick={() => setShowDomainSelector(true)}
            >
              Get Started Free
              <ArrowRight className="ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 transition-all duration-200 hover:bg-[rgba(139,124,255,0.08)]"
              style={{ borderColor: 'rgba(139,124,255,0.3)', color: '#B69CFF' }}
              onClick={() => navigate('/assessment')}
            >
              Take Assessment
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '50+', label: 'Career Paths', color: '#8B7CFF' },
              { value: '100%', label: 'Free Resources', color: '#FFB199' },
              { value: 'AI', label: 'Powered', color: '#00E5FF' },
              { value: 'India', label: 'Focused', color: '#B69CFF' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-[14px] animate-fade-in"
                style={{
                  background: '#12141C',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animationDelay: `${i * 0.1}s`,
                }}>
                <div className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: 'Sora, Inter, sans-serif' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#6B6F7A' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
              EVERYTHING YOU NEED TO{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                SUCCEED
              </span>
            </h2>
            <p style={{ color: '#6B6F7A' }}>Three pillars of your career transformation</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'AI Career Assessment',
                desc: 'Take our comprehensive 15-question assessment powered by Google Gemini to discover careers that match your interests, aptitude, and goals.',
                glow: '#8B7CFF',
                border: 'rgba(139,124,255,0.2)',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Roadmaps',
                desc: 'Get customized learning roadmaps with domain-specific resources: GFG for tech, Behance for design, and more curated platforms.',
                glow: '#00E5FF',
                border: 'rgba(0,229,255,0.2)',
              },
              {
                icon: Award,
                title: 'Track Progress',
                desc: 'Monitor your learning journey with gamified progress tracking, streaks, and auto-generated portfolio from your skills.',
                glow: '#FFB199',
                border: 'rgba(255,177,153,0.2)',
              },
            ].map(({ icon: Icon, title, desc, glow, border }, i) => (
              <div key={i} className="card-hover rounded-[14px] p-6 cursor-pointer"
                style={{ background: '#12141C', border: `1px solid ${border}`, boxShadow: `0 4px 24px -8px ${glow}20` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${glow}12`, border: `1px solid ${border}` }}>
                  <Icon className="w-6 h-6" style={{ color: glow }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>{title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: '#A0A3B1' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Domains Preview */}
      <section className="relative container px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl mb-3" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
              EXPLORE CAREER{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                DOMAINS
              </span>
            </h2>
            <p style={{ color: '#6B6F7A' }}>Choose from technology, design, business, or healthcare paths</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: '💻', title: 'Technology', desc: 'Backend, Frontend, Data Science, ML & more', from: '#1a1040', to: '#12141C' },
              { emoji: '🎨', title: 'Design', desc: 'UI/UX, Graphic Design, Product Design', from: '#201040', to: '#12141C' },
              { emoji: '📊', title: 'Business', desc: 'Product Manager, Analyst, Marketing', from: '#141228', to: '#12141C' },
              { emoji: '⚕️', title: 'Healthcare', desc: 'Medical Coding, Health Analytics', from: '#101828', to: '#12141C' },
            ].map((card, i) => (
              <div key={i} className="card-hover p-6 rounded-[14px] cursor-pointer relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})`, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="absolute inset-0 opacity-30"
                  style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.06), transparent 60%)' }} />
                <div className="relative">
                  <div className="text-4xl mb-3">{card.emoji}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>{card.title}</h3>
                  <p className="text-sm" style={{ color: '#A0A3B1' }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              className="font-semibold px-8 text-white"
              style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                border: 'none',
                boxShadow: '0 0 24px -5px rgba(139,124,255,0.45)',
              }}
              onClick={() => setShowDomainSelector(true)}
            >
              Explore All Domains
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative container px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-center mb-14" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            HOW IT{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              WORKS
            </span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '1', title: 'Take the Assessment', desc: 'Answer 15-20 questions about your interests, aptitude, skills, and goals. Our AI analyzes your profile to recommend the best career matches.', color: '#8B7CFF' },
              { num: '2', title: 'Select Your Career', desc: 'Review recommended careers with detailed fit scores, market outlook, and salary information. Choose the one that excites you most.', color: '#00E5FF' },
              { num: '3', title: 'Follow Your Roadmap', desc: 'Get a personalized learning roadmap with curated free resources from domain-specific platforms like GFG, YouTube, Coursera, and more.', color: '#FFB199' },
              { num: '4', title: 'Track & Build', desc: 'Mark topics complete, track your progress, build your skills portfolio, and export your resume when you\'re job-ready.', color: '#56D364' },
            ].map((step, i) => (
              <div key={i} className="flex gap-5 p-5 rounded-[14px] card-hover"
                style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}80)`, boxShadow: `0 0 16px -4px ${step.color}60` }}>
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#A0A3B1' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative container px-4 py-16 pb-24">
        <div className="max-w-4xl mx-auto rounded-[20px] p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1040 0%, #12141C 50%, #0D0E14 100%)',
            border: '1px solid rgba(139,124,255,0.25)',
            boxShadow: '0 0 80px -20px rgba(139,124,255,0.3)',
          }}>

          {/* Inner glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #8B7CFF, transparent)' }} />

          <div className="flex justify-center mb-6">
            <Star className="w-8 h-8 animate-pulse" style={{ color: '#8B7CFF' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            Ready to Launch Your Career?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#A0A3B1' }}>
            Join thousands of students discovering their perfect career path
          </p>
          <Button
            size="lg"
            className="text-base font-semibold px-10 py-6 text-white"
            style={{
              background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
              border: 'none',
              boxShadow: '0 0 30px -5px rgba(139,124,255,0.6)',
            }}
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
