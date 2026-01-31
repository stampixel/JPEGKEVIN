import React, { useState, useEffect, useMemo, useRef } from 'react';

// Import all images from both folders eagerly
const portfolioImages = import.meta.glob('/src/assets/portfolio/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}', { eager: true });
const michiganDailyImages = import.meta.glob('/src/assets/michigan-daily/*.{jpg,jpeg,png,webp,svg,JPG,JPEG,PNG,WEBP,SVG}', { eager: true });

// Import metadata for michigan-daily
import michiganDailyMetadata from '../assets/michigan-daily/metadata.json';

const imageSets = {
  portfolio: portfolioImages,
  'michigan-daily': michiganDailyImages,
};

const metadataSets = {
  'michigan-daily': michiganDailyMetadata.photos || {},
};

// Lazy load images but never unload
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

// Hook to detect image orientation
const useImageOrientations = (photos) => {
  const [orientations, setOrientations] = useState({});

  useEffect(() => {
    const loadOrientations = async () => {
      const results = {};
      await Promise.all(
        photos.map((photo) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              results[photo.name] = img.width > img.height ? 'horizontal' : 'vertical';
              resolve();
            };
            img.onerror = () => {
              results[photo.name] = 'horizontal';
              resolve();
            };
            img.src = photo.src;
          });
        })
      );
      setOrientations(results);
    };

    if (photos.length > 0) {
      loadOrientations();
    }
  }, [photos]);

  return orientations;
};

const Gallery = ({ folder = 'portfolio' }) => {
  const metadata = metadataSets[folder] || {};
  
  const photos = useMemo(() => {
    const imagesGlob = imageSets[folder] || portfolioImages;
    return Object.entries(imagesGlob).map(([path, module]) => {
      const name = path.split('/').pop();
      const photoMeta = metadata[name] || {};
      return { 
        name, 
        src: module.default,
        description: photoMeta.description || '',
        date: photoMeta.date || '',
      };
    });
  }, [folder, metadata]);

  const orientations = useImageOrientations(photos);
  const [shuffleSeed, setShuffleSeed] = useState(Date.now());
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const reshuffle = () => {
    setShuffleSeed(Date.now());
  };

  // Row sizes: Mobile = 1 horizontal, 2 vertical | Desktop = 2 horizontal, 3 vertical
  const horizontalPerRow = isMobile ? 1 : 2;
  const verticalPerRow = isMobile ? 2 : 3;

  // Create randomly ordered rows alternating between horizontal and vertical
  const photoRows = useMemo(() => {
    if (Object.keys(orientations).length === 0) return [];

    // Separate and shuffle photos by orientation
    const horizontal = shuffleArray(
      photos.filter(p => orientations[p.name] === 'horizontal'),
      shuffleSeed
    );
    const vertical = shuffleArray(
      photos.filter(p => orientations[p.name] === 'vertical'),
      shuffleSeed + 1000
    );

    const rows = [];
    let hIdx = 0;
    let vIdx = 0;
    let rowSeed = shuffleSeed;

    // Randomly alternate between horizontal and vertical rows
    while (hIdx < horizontal.length || vIdx < vertical.length) {
      const canDoHorizontal = horizontal.length - hIdx >= horizontalPerRow;
      const canDoVertical = vertical.length - vIdx >= verticalPerRow;
      
      // Randomly choose row type if both are possible
      let doHorizontal;
      if (canDoHorizontal && canDoVertical) {
        doHorizontal = seededRandom(rowSeed++) > 0.5;
      } else if (canDoHorizontal) {
        doHorizontal = true;
      } else if (canDoVertical) {
        doHorizontal = false;
      } else {
        // Handle remaining photos
        if (hIdx < horizontal.length) {
          rows.push({
            type: 'horizontal',
            photos: horizontal.slice(hIdx),
          });
          hIdx = horizontal.length;
        }
        if (vIdx < vertical.length) {
          rows.push({
            type: 'vertical',
            photos: vertical.slice(vIdx),
          });
          vIdx = vertical.length;
        }
        break;
      }

      if (doHorizontal) {
        rows.push({
          type: 'horizontal',
          photos: horizontal.slice(hIdx, hIdx + horizontalPerRow),
        });
        hIdx += horizontalPerRow;
      } else {
        rows.push({
          type: 'vertical',
          photos: vertical.slice(vIdx, vIdx + verticalPerRow),
        });
        vIdx += verticalPerRow;
      }
    }

    // Add global index for display
    let globalIdx = 0;
    rows.forEach(row => {
      row.photos = row.photos.map(photo => ({
        ...photo,
        globalIndex: globalIdx++,
      }));
    });

    return rows;
  }, [photos, orientations, shuffleSeed, horizontalPerRow, verticalPerRow]);

  // Flat list for lightbox navigation
  const allPhotos = useMemo(() => {
    return photoRows.flatMap(row => row.photos);
  }, [photoRows]);

  const openLightbox = (photo) => setSelectedPhoto(photo);
  const closeLightbox = () => setSelectedPhoto(null);

  const currentIndex = selectedPhoto 
    ? allPhotos.findIndex(p => p.name === selectedPhoto.name)
    : -1;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (currentIndex !== -1 && currentIndex < allPhotos.length - 1) {
      setSelectedPhoto(allPhotos[currentIndex + 1]);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (currentIndex !== -1 && currentIndex > 0) {
      setSelectedPhoto(allPhotos[currentIndex - 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') {
        const idx = allPhotos.findIndex(p => p.name === selectedPhoto.name);
        if (idx !== -1 && idx < allPhotos.length - 1) setSelectedPhoto(allPhotos[idx + 1]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = allPhotos.findIndex(p => p.name === selectedPhoto.name);
        if (idx !== -1 && idx > 0) setSelectedPhoto(allPhotos[idx - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, allPhotos]);

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
      <div className="mx-2 mb-4 p-2 md:mx-4 md:p-4 lg:mx-12 lg:mb-6 bg-bg-secondary border border-border-light flex flex-row justify-between items-center gap-4 relative
        before:content-['+'] before:absolute before:-top-[3px] before:-left-[3px] before:text-[0.7rem] before:text-text-muted before:font-mono
        after:content-['+'] after:absolute after:-bottom-[3px] after:-right-[3px] after:text-[0.7rem] after:text-text-muted after:font-mono">
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
        <div className="text-[0.7rem] text-text-muted uppercase tracking-[0.1em]">
          {photos.length} exposures
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex flex-col gap-3 px-2 md:gap-5 md:px-4 lg:gap-6 lg:px-12">
        {photoRows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`flex gap-3 md:gap-5 lg:gap-6 ${
              row.type === 'horizontal' ? 'justify-center' : ''
            }`}
          >
            {row.photos.map((photo) => (
              <div 
                key={photo.name} 
                className={`relative cursor-pointer transition-transform duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 group ${
                  row.type === 'horizontal' 
                    ? 'w-full md:w-1/2'
                    : 'w-1/2 md:w-1/3'
                }`}
                onClick={() => openLightbox(photo)}
              >
                {/* Photo frame border */}
                <div className="absolute -inset-1.5 md:-inset-3 bg-bg-secondary border border-border-light -z-10 transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] group-hover:border-text-secondary" />
                
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
                  {photo.description ? (
                    <span className="text-white/90 text-[0.7rem] leading-relaxed">{photo.description}</span>
                  ) : (
                    <span className="text-white/90 text-[0.65rem] uppercase tracking-[0.1em]">{photo.name}</span>
                  )}
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
              {formatFrameNumber(currentIndex)} / {formatFrameNumber(allPhotos.length - 1)}
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
              <div className="flex flex-col gap-0.5 flex-1">
                {selectedPhoto.description ? (
                  <>
                    <span className="text-[0.7rem] text-white/50 uppercase tracking-[0.1em]">Description</span>
                    <span className="text-white/90 text-sm leading-relaxed">{selectedPhoto.description}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[0.7rem] text-white/50 uppercase tracking-[0.1em]">Filename</span>
                    <span className="text-white/90 text-xs">{selectedPhoto.name}</span>
                  </>
                )}
              </div>
              {selectedPhoto.date && (
                <div className="flex flex-col gap-0.5 text-right ml-6">
                  <span className="text-[0.7rem] text-white/50 uppercase tracking-[0.1em]">Date</span>
                  <span className="text-white/90 text-xs">{selectedPhoto.date}</span>
                </div>
              )}
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
            {currentIndex < allPhotos.length - 1 && (
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
