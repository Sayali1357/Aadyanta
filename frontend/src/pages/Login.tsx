import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, Mail, Lock, Eye, EyeOff, User, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginProps {
  isSignup?: boolean;
}

const Login = ({ isSignup = false }: LoginProps) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully! Complete the career assessment to get started.');
        navigate('/assessment');
      } else {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || `${isSignup ? 'Registration' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0B0C10' }}>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(ellipse, #8B7CFF 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[200px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #00E5FF 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5">
            <div className="p-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', boxShadow: '0 0 20px -4px rgba(139,124,255,0.6)' }}>
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
              Career<span style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Launch</span> AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            {isSignup ? 'Create Account' : 'Welcome back'}
          </h1>
          <p className="mt-1" style={{ color: '#6B6F7A' }}>
            {isSignup
              ? 'Start your personalized learning journey'
              : 'Sign in to continue your learning'}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-[14px] p-7 md:p-9 animate-scale-in"
          style={{
            background: '#12141C',
            border: '1px solid rgba(139,124,255,0.15)',
            boxShadow: '0 8px 40px -10px rgba(139,124,255,0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
          }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#A0A3B1' }}>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(139,124,255,0.6)' }} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-transparent text-white placeholder:text-[#6B6F7A]"
                    style={{ borderColor: 'rgba(139,124,255,0.2)' }}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#A0A3B1' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(139,124,255,0.6)' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-transparent text-white placeholder:text-[#6B6F7A]"
                  style={{ borderColor: 'rgba(139,124,255,0.2)' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              {!isSignup && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#A0A3B1' }}>Password</Label>
                  <a href="#" className="text-sm transition-colors duration-200" style={{ color: '#8B7CFF' }}>
                    Forgot password?
                  </a>
                </div>
              )}
              {isSignup && <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#A0A3B1' }}>Password</Label>}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(139,124,255,0.6)' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-transparent text-white placeholder:text-[#6B6F7A]"
                  style={{ borderColor: 'rgba(139,124,255,0.2)' }}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: '#6B6F7A' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignup && (
                <p className="text-xs" style={{ color: '#6B6F7A' }}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <Button
              className="w-full py-5 font-semibold text-base mt-2 text-white"
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                border: 'none',
                boxShadow: '0 0 24px -5px rgba(139,124,255,0.5)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </>
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <p className="text-center text-sm" style={{ color: '#6B6F7A' }}>
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium transition-colors duration-200" style={{ color: '#8B7CFF' }}>
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium transition-colors duration-200" style={{ color: '#8B7CFF' }}>
                  Sign up
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#6B6F7A' }}>
          By continuing, you agree to our{' '}
          <a href="#" className="transition-colors duration-200" style={{ color: 'rgba(139,124,255,0.7)' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="transition-colors duration-200" style={{ color: 'rgba(139,124,255,0.7)' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
