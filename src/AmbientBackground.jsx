import { useEffect, useState, useRef } from 'react';

export default function AmbientBackground() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(true);
  const rafRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // subtle cursor-reactive parallax (desktop pointer devices only)
    if (window.innerWidth >= 768 && !window.matchMedia('(pointer: coarse)').matches) {
      const handleMouseMove = (e) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          // Normalize coordinates between -1 and 1
          const x = (e.clientX / window.innerWidth) * 2 - 1;
          const y = (e.clientY / window.innerHeight) * 2 - 1;
          setCoords({ x: x * 10, y: y * 10 }); // Soft 10px drift limit
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="ambient-bg-wrapper">
      <div 
        className="ambient-aurora-primary" 
        style={!isMobile ? { transform: `translate3d(${coords.x}px, ${coords.y}px, 0)` } : {}}
      />
      <div 
        className="ambient-aurora-secondary" 
        style={!isMobile ? { transform: `translate3d(${-coords.x * 0.8}px, ${-coords.y * 0.8}px, 0)` } : {}}
      />
      <div className="ambient-noise-texture" />
      <div className="ambient-particles">
        <div className="ambient-particle p1" />
        <div className="ambient-particle p2" />
        <div className="ambient-particle p3" />
        <div className="ambient-particle p4" />
        <div className="ambient-particle p5" />
        {!isMobile && (
          <>
            <div className="ambient-particle p6" />
            <div className="ambient-particle p7" />
            <div className="ambient-particle p8" />
          </>
        )}
      </div>
    </div>
  );
}