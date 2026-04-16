import { Link } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { userProfile, isAuthenticated } = useAuth();
  const roadmapHref =
    isAuthenticated && userProfile?.selectedCareer?.careerId
      ? `/roadmap/${userProfile.selectedCareer.careerId}`
      : "/assessment";

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(11,12,16,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', boxShadow: '0 0 16px -4px rgba(139,124,255,0.5)' }}>
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
                Career<span style={{
                  background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Launch</span> AI
              </span>
            </Link>
            <p className="text-sm" style={{ color: '#6B6F7A' }}>
              AI-powered career guidance to help you find your perfect path and build the skills you need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>Platform</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#6B6F7A' }}>
              <li><Link to="/assessment" className="hover:text-[#8B7CFF] transition-colors duration-200">Career Assessment</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#8B7CFF] transition-colors duration-200">Dashboard</Link></li>
              <li><Link to={roadmapHref} className="hover:text-[#8B7CFF] transition-colors duration-200">Learning Roadmaps</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>Resources</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#6B6F7A' }}>
              <li><a href="#" className="hover:text-[#8B7CFF] transition-colors duration-200">Blog</a></li>
              <li><a href="#" className="hover:text-[#8B7CFF] transition-colors duration-200">Career Guides</a></li>
              <li><a href="#" className="hover:text-[#8B7CFF] transition-colors duration-200">Free Courses</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>Connect</h4>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Github, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href}
                  className="p-2 rounded-lg transition-all duration-200 hover:shadow-glow"
                  style={{ background: 'rgba(139,124,255,0.08)', border: '1px solid rgba(139,124,255,0.15)' }}>
                  <Icon className="h-4 w-4" style={{ color: '#8B7CFF' }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: '#6B6F7A' }}>
          <p>© {new Date().getFullYear()} CareerLaunch AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
