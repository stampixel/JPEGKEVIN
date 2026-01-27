import React, { useState, useEffect, useMemo, useRef } from 'react';

const imagesGlob = import.meta.glob('/src/assets/portfolio/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}', { eager: true });

// lazy load images but no unload
const PersistentImage = ({ src, alt, className }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : undefined}
      data-src={src}
      alt={alt}
      className={className}
      style={{ minHeight: shouldLoad ? undefined : '200px' }}
    />
  );
};

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const shuffleArray = (array, seed) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Gallery = () => {
  const photos = useMemo(() => {
    return Object.entries(imagesGlob).map(([path, module]) => {
      const name = path.split('/').pop();
      const ext = name.split('.').pop().toLowerCase();
      return { name, src: module.default, ext };
    });
  }, []);

  const [sortBy, setSortBy] = useState('name-asc');
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());
  const [columns, setColumns] = useState(3);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    // Generate new seed when switching to random
    if (newSort === 'random') {
      setShuffleSeed(Date.now());
    }
  };

  const reshuffle = () => {
    setShuffleSeed(Date.now());
  };

  const sortedPhotos = useMemo(() => {
    const sorted = [...photos];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
        break;
      case 'ext-asc':
        sorted.sort((a, b) => a.ext.localeCompare(b.ext) || a.name.localeCompare(b.name, undefined, { numeric: true }));
        break;
      case 'random':
        return shuffleArray(sorted, shuffleSeed);
      default:
        break;
    }
    return sorted;
  }, [photos, sortBy, shuffleSeed]);

  const columnWrapper = useMemo(() => {
    const cols = Array.from({ length: columns }, () => []);
    sortedPhotos.forEach((photo, i) => {
      cols[i % columns].push({ ...photo, globalIndex: i });
    });
    return cols;
  }, [sortedPhotos, columns]);

  const openLightbox = (photo) => setSelectedPhoto(photo);
  const closeLightbox = () => setSelectedPhoto(null);

  const currentIndex = selectedPhoto 
    ? sortedPhotos.findIndex(p => p.name === selectedPhoto.name)
    : -1;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (currentIndex !== -1 && currentIndex < sortedPhotos.length - 1) {
      setSelectedPhoto(sortedPhotos[currentIndex + 1]);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (currentIndex !== -1 && currentIndex > 0) {
      setSelectedPhoto(sortedPhotos[currentIndex - 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') {
        const idx = sortedPhotos.findIndex(p => p.name === selectedPhoto.name);
        if (idx !== -1 && idx < sortedPhotos.length - 1) setSelectedPhoto(sortedPhotos[idx + 1]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = sortedPhotos.findIndex(p => p.name === selectedPhoto.name);
        if (idx !== -1 && idx > 0) setSelectedPhoto(sortedPhotos[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, sortedPhotos]);

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPhoto]);

  const formatFrameNumber = (n) => String(n + 1).padStart(3, '0');

  return (
    <>
      {/* Toolbar */}
      <div className="mx-2 mb-4 p-2 md:mx-4 md:p-4 lg:mx-12 lg:mb-6 bg-bg-secondary border border-border-light flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative
        before:content-['+'] before:absolute before:-top-[3px] before:-left-[3px] before:text-[0.7rem] before:text-text-muted before:font-mono
        after:content-['+'] after:absolute after:-bottom-[3px] after:-right-[3px] after:text-[0.7rem] after:text-text-muted after:font-mono">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <span className="text-[0.7rem] uppercase tracking-[0.15em] text-text-secondary">Sort by</span>
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="border py-2 px-3 pr-9 font-mono text-xs cursor-pointer outline-none transition-all duration-200 appearance-none w-full md:w-auto md:min-w-[180px] bg-no-repeat"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border-light)',
              color: 'var(--color-text-primary)',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a5a55' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 12px center'
            }}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="ext-asc">File Type</option>
            <option value="random">Random</option>
          </select>
          {sortBy === 'random' && (
            <button
              onClick={reshuffle}
              className="border py-2 px-3 font-mono text-xs cursor-pointer transition-all duration-200 hover:border-text-secondary"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-text-primary)',
              }}
            >
              ↻ Shuffle
            </button>
          )}
        </div>
        <div className="text-[0.7rem] text-text-muted uppercase tracking-[0.1em]">
          {photos.length} exposures
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex gap-2 px-2 md:gap-4 md:px-4 lg:gap-6 lg:px-12 items-start">
        {columnWrapper.map((colImages, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-2 md:gap-4 lg:gap-6 min-w-0">
            {colImages.map((photo) => (
              <div 
                key={photo.name} 
                className="relative cursor-pointer transition-transform duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 group"
                onClick={() => openLightbox(photo)}
              >
                {/* Film frame border */}
                <div className="absolute -inset-1.5 md:-inset-3 bg-bg-secondary border border-border-light -z-10 transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] group-hover:border-text-secondary" />
                
                {/* Film sprocket holes - hidden on mobile */}
                <div className="hidden lg:block absolute top-0 bottom-0 -left-5 w-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100
                  bg-[repeating-linear-gradient(to_bottom,var(--color-bg-primary)_0px,var(--color-bg-primary)_4px,var(--color-border-light)_4px,var(--color-border-light)_8px)]" 
                  style={{ top: '-12px', bottom: '-12px' }}
                />
                
                <PersistentImage 
                  src={photo.src} 
                  alt={photo.name} 
                  className="w-full h-auto block relative z-10"
                />
                
                {/* Frame number */}
                <span className="absolute -bottom-1.5 md:-bottom-2.5 right-1 text-[0.5rem] md:text-[0.6rem] text-text-muted font-mono tracking-[0.1em] z-20">
                  {formatFrameNumber(photo.globalIndex)}
                </span>
                
                {/* Hover info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-4 opacity-0 transition-opacity duration-300 z-30 group-hover:opacity-100">
                  <span className="text-white/90 text-[0.65rem] uppercase tracking-[0.1em]">{photo.name}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 z-[1000] flex justify-center items-center animate-[fadeIn_0.3s_ease]"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col animate-[scaleIn_0.3s_cubic-bezier(0.25,0.46,0.45,0.94)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Counter */}
            <span className="absolute -top-12 left-0 text-xs text-white/50 tracking-[0.1em]">
              {formatFrameNumber(currentIndex)} / {formatFrameNumber(sortedPhotos.length - 1)}
            </span>
            
            {/* Close button */}
            <button 
              className="absolute -top-12 right-0 bg-transparent border border-white/20 text-white/70 w-10 h-10 text-2xl cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white"
              onClick={closeLightbox}
            >
              ×
            </button>
            
            {/* Lightbox frame */}
            <div className="relative bg-bg-dark p-5">
              {/* Sprocket holes */}
              <div className="absolute top-0 bottom-0 left-0 w-4 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_8px,rgba(255,255,255,0.1)_8px,rgba(255,255,255,0.1)_16px,transparent_16px,transparent_24px)]" />
              <div className="absolute top-0 bottom-0 right-0 w-4 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_8px,rgba(255,255,255,0.1)_8px,rgba(255,255,255,0.1)_16px,transparent_16px,transparent_24px)]" />
              
              <div className="flex justify-center items-center px-6">
                <img 
                  src={selectedPhoto.src} 
                  alt={selectedPhoto.name} 
                  className="max-w-full max-h-[75vh] block object-contain"
                />
              </div>
            </div>
            
            {/* Metadata bar */}
            <div className="flex justify-between items-center p-4 bg-white/[0.03] border-t border-white/10 mt-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] text-white/50 uppercase tracking-[0.1em]">Filename</span>
                <span className="text-white/90 text-xs">{selectedPhoto.name}</span>
              </div>
            </div>
            
            {/* Nav Arrows */}
            {currentIndex > 0 && (
              <button 
                className="fixed left-5 top-1/2 -translate-y-1/2 bg-white/5 text-white/70 border border-white/10 w-15 h-20 text-2xl cursor-pointer transition-all duration-200 flex items-center justify-center font-mono hover:bg-white/10 hover:border-white/30 hover:text-white
                  md:w-15 md:h-20 max-md:bottom-8 max-md:top-auto max-md:translate-y-0 max-md:w-12 max-md:h-12 max-md:rounded-full"
                onClick={prevPhoto}
              >
                ←
              </button>
            )}
            {currentIndex < sortedPhotos.length - 1 && (
              <button 
                className="fixed right-5 top-1/2 -translate-y-1/2 bg-white/5 text-white/70 border border-white/10 w-15 h-20 text-2xl cursor-pointer transition-all duration-200 flex items-center justify-center font-mono hover:bg-white/10 hover:border-white/30 hover:text-white
                  md:w-15 md:h-20 max-md:bottom-8 max-md:top-auto max-md:translate-y-0 max-md:w-12 max-md:h-12 max-md:rounded-full"
                onClick={nextPhoto}
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
