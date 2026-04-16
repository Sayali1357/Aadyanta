import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Roadmap URL — avoid duplicating `/assessment` (Career Assessment uses that path)
  const roadmapPath = userProfile?.selectedCareer?.careerId
    ? `/roadmap/${userProfile.selectedCareer.careerId}`
    : '/dashboard';

  // Different nav links for authenticated vs unauthenticated users
  const publicNavLinks = [
    { path: "/", label: "Home" },
  ];

  const authenticatedNavLinks = [
    { path: "/", label: "Home" },
    { path: roadmapPath, label: "Roadmap" },
    { path: "/assessment", label: "Career Assessment" },
    { path: "/interview", label: "Mock Interview" },
    { path: "/gap-analysis", label: "Gap Analysis" },
  ];

  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  const isActive = (path: string, label: string) => {
    if (label === 'Roadmap') {
      if (path.startsWith('/roadmap')) return location.pathname.startsWith('/roadmap');
      if (path === '/dashboard') return location.pathname === '/dashboard';
      return false;
    }
    if (path.startsWith('/roadmap')) return location.pathname.startsWith('/roadmap');
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full relative"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(11,12,16,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="CareerLaunch AI Logo"
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            Career<span style={{
              background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Launch</span> AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path, link.label);
            return (
              <Link key={`nav-${link.label}`} to={link.path}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`relative transition-all duration-200 ease-out ${
                    active
                      ? 'font-semibold text-white'
                      : 'text-[#A0A3B1] hover:text-[#EAEAF0]'
                  }`}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(139,124,255,0.15), rgba(182,156,255,0.08))',
                    boxShadow: '0 0 12px -4px rgba(139,124,255,0.2)',
                  } : {}}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #8B7CFF, #B69CFF)' }} />
                  )}
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2"
                  style={{ borderColor: 'rgba(139,124,255,0.2)', color: '#EAEAF0' }}>
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user?.name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56"
                style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" style={{ color: '#EAEAF0' }}>{user?.name}</p>
                    <p className="text-xs leading-none" style={{ color: '#6B6F7A' }}>{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.05)' }} />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}
                  className="cursor-pointer hover:!bg-[rgba(139,124,255,0.1)]">
                  <LayoutDashboard className="mr-2 h-4 w-4" style={{ color: '#8B7CFF' }} />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ background: 'rgba(255,255,255,0.05)' }} />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" style={{ color: '#A0A3B1' }}
                  className="hover:!text-[#EAEAF0] transition-colors duration-200">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="default"
                  style={{
                    background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                    border: 'none',
                    boxShadow: '0 0 20px -5px rgba(139,124,255,0.5)',
                    color: '#fff',
                  }}
                  className="hover:opacity-90 transition-opacity duration-200">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[rgba(139,124,255,0.1)] transition-colors duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t p-4 animate-slide-down"
          style={{ borderColor: 'rgba(255,255,255,0.05)', background: '#0D0E14' }}>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path, link.label);
              return (
                <Link key={`nav-${link.label}`} to={link.path} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className="w-full justify-start transition-all duration-200"
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(139,124,255,0.15), rgba(182,156,255,0.08))',
                      borderLeft: '3px solid #8B7CFF',
                      color: '#EAEAF0',
                    } : { color: '#A0A3B1' }}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            <div className="border-t pt-3 mt-2 flex flex-col gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium" style={{ color: '#EAEAF0' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: '#6B6F7A' }}>{user?.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    style={{ borderColor: 'rgba(139,124,255,0.2)' }}
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" style={{ color: '#8B7CFF' }} />
                    Dashboard
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}>Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full"
                      style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff' }}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
