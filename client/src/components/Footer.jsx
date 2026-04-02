import React from 'react';
import { Github, Linkedin, Mail, Heart, Code } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">LifeVault</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Preserve your memories, share your legacy, and connect with loved ones across time and space.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/present-vault" className="text-slate-400 hover:text-white transition-colors">
                  Present Vault
                </a>
              </li>
              <li>
                <a href="/future-vault" className="text-slate-400 hover:text-white transition-colors">
                  Future Vault
                </a>
              </li>
              <li>
                <a href="/death-vault" className="text-slate-400 hover:text-white transition-colors">
                  Death Vault
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Connect</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/patankaif"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com/in/patankaif"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:patankaif23@gmail.com"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                title="Email"
              >
                <Mail size={18} />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Built with <Code size={12} className="inline mx-1" /> and lots of <Heart size={12} className="inline mx-1 text-red-400" />
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              © {currentYear} LifeVault. All rights reserved.
            </div>
            <div className="text-sm text-slate-400">
              Developed by{' '}
              <a
                href="https://github.com/patankaif"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                Patan Kaif Khan
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <a href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
