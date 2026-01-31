import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Gallery from './components/Gallery';

function App() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Determine page title and subtitle based on route
  const isMichiganDaily = location.pathname === '/michigan-daily';
  const pageTitle = isMichiganDaily ? 'Michigan Daily' : 'Kevin Tang';
  const pageSubtitle = isMichiganDaily ? 'Photo Journalism' : 'Selected Works';
  const frameNumber = isMichiganDaily ? '№ 002' : '№ 001';
  
  return (
    <div className="max-w-7xl mx-auto pb-20 relative">
      {/* Side film strip decorations */}
      <div className="fixed top-0 bottom-0 left-0 w-6 opacity-[0.08] pointer-events-none z-50 bg-[repeating-linear-gradient(to_bottom,var(--color-bg-dark)_0px,var(--color-bg-dark)_8px,transparent_8px,transparent_16px)] hidden lg:block" />
      <div className="fixed top-0 bottom-0 right-0 w-6 opacity-[0.08] pointer-events-none z-50 bg-[repeating-linear-gradient(to_bottom,var(--color-bg-dark)_0px,var(--color-bg-dark)_8px,transparent_8px,transparent_16px)] hidden lg:block" />
      
      <header className="px-4 pt-12 pb-6 md:px-6 lg:px-12 lg:pt-20 lg:pb-12 relative">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 md:gap-6">
          <div className="relative">
            {/* Decorative frame number */}
            <span className="absolute -top-5 left-0 font-mono text-[0.65rem] text-text-muted tracking-[0.15em]">{frameNumber}</span>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-none text-text-primary">{pageTitle}</h1>
            </Link>
            <p className="font-mono text-xs text-text-secondary uppercase tracking-[0.2em] mt-2">{pageSubtitle}</p>
          </div>
          <div className="text-left md:text-right text-[0.7rem] text-text-muted leading-relaxed">
            <span className="block">35mm / Digital</span>
            <span className="block">{currentYear}</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 flex gap-6 font-mono text-xs uppercase tracking-[0.15em]">
          <Link 
            to="/" 
            className={`transition-colors duration-200 ${
              location.pathname === '/' 
                ? 'text-text-primary border-b border-text-primary pb-1' 
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Portfolio
          </Link>
          <Link 
            to="/michigan-daily" 
            className={`transition-colors duration-200 ${
              location.pathname === '/michigan-daily' 
                ? 'text-text-primary border-b border-text-primary pb-1' 
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Michigan Daily
          </Link>
        </nav>
        
        {/* Divider line */}
        <div className="mt-6 lg:mt-12 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<Gallery folder="portfolio" />} />
          <Route path="/michigan-daily" element={<Gallery folder="michigan-daily" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
