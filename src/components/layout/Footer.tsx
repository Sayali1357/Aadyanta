import { Link } from "react-router-dom";
import { Rocket, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid hsl(217 97% 58% / 0.12)', background: 'hsl(222 60% 3%)' }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(217 97% 58%), hsl(195 100% 45%))', boxShadow: '0 0 16px -4px hsl(217 97% 58% / 0.5)' }}>
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Career<span style={{ background: 'linear-gradient(135deg, hsl(217 97% 65%), hsl(195 100% 55%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Launch</span> AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered career guidance to help you find your perfect path and build the skills you need.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/assessment" className="hover:text-primary transition-colors">Career Assessment</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/roadmap" className="hover:text-primary transition-colors">Learning Roadmaps</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Career Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Free Courses</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg transition-all" style={{ background: 'hsl(217 97% 58% / 0.1)', border: '1px solid hsl(217 97% 58% / 0.2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px -4px hsl(217 97% 58% / 0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                <Twitter className="h-4 w-4 text-blue-400" />
              </a>
              <a href="#" className="p-2 rounded-lg transition-all" style={{ background: 'hsl(217 97% 58% / 0.1)', border: '1px solid hsl(217 97% 58% / 0.2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px -4px hsl(217 97% 58% / 0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                <Linkedin className="h-4 w-4 text-blue-400" />
              </a>
              <a href="#" className="p-2 rounded-lg transition-all" style={{ background: 'hsl(217 97% 58% / 0.1)', border: '1px solid hsl(217 97% 58% / 0.2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px -4px hsl(217 97% 58% / 0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                <Github className="h-4 w-4 text-blue-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-sm text-slate-600" style={{ borderTop: '1px solid hsl(217 97% 58% / 0.1)' }}>
          <p>© {new Date().getFullYear()} CareerLaunch AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
