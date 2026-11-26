import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLiveEngine } from '../context/LiveEngineContext';
import { MsaLogo } from './MsaLogo';

const NAV_LINKS = [
  { href: '#sensing', label: 'Sensing' },
  { href: '#fusion', label: 'Fusion Engine' },
  { href: '#calibration', label: 'Calibration' },
  { href: '#validation', label: 'Validation' },
  { href: '#privacy', label: 'Privacy' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openWorkspace, workspaceMode } = useLiveEngine();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.55);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-[#1F2A38]/8 text-[#1F2A38]'
          : 'bg-[#1F2A38]/80 backdrop-blur-md border-b border-[#E8EEF5]/10 text-[#FFFFFF]'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Single clean brand lockup */}
        <a
          href="#hero"
          aria-label="MSA Home"
          onClick={() => setMobileMenuOpen(false)}
          className="whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A6C85] rounded-md"
        >
          <MsaLogo variant={scrolled ? 'dark' : 'light'} />
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary navigation"
          className={`hidden md:flex items-center gap-7 text-sm font-medium ${
            scrolled ? 'text-[#5A6C85]' : 'text-[#E8EEF5]/80'
          }`}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap shrink-0 transition-colors duration-150 hover:underline underline-offset-4 ${
                scrolled ? 'hover:text-[#1F2A38]' : 'hover:text-[#FFFFFF]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary action CTA + mobile drawer toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openWorkspace({ tab: 'sensors' });
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 min-h-[38px] sm:min-h-0 py-1.5 sm:py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              scrolled
                ? 'bg-[#1F2A38] text-[#FFFFFF] hover:bg-[#2B3A4D] focus-visible:ring-[#1F2A38]'
                : 'bg-[#E8EEF5] text-[#1F2A38] hover:bg-[#FFFFFF] focus-visible:ring-[#E8EEF5]'
            }`}
          >
            <span className="sm:hidden">
              {workspaceMode === 'docked' ? 'Resume' : 'Live Analyser'}
            </span>
            <span className="hidden sm:inline">
              {workspaceMode === 'docked' ? 'Resume Live Analyser' : 'Launch Live Analyser'}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`md:hidden inline-flex items-center justify-center rounded-full min-w-[44px] min-h-[44px] p-2 transition-colors cursor-pointer ${
              scrolled
                ? 'text-[#1F2A38] hover:bg-[#E8EEF5]'
                : 'text-[#E8EEF5] hover:bg-[#FFFFFF]/10'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className={`md:hidden border-t px-4 py-3 flex flex-col gap-1 ${
            scrolled
              ? 'bg-white/95 border-[#1F2A38]/8 text-[#1F2A38]'
              : 'bg-[#1F2A38]/95 border-[#E8EEF5]/10 text-[#FFFFFF]'
          }`}
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-xl px-3 min-h-[44px] flex items-center text-sm font-medium transition-colors ${
                scrolled ? 'hover:bg-[#E8EEF5]/70' : 'hover:bg-[#FFFFFF]/10'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
