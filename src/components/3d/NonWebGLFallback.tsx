import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';
import { SignatureDishOption } from '../../types/dining';

interface NonWebGLFallbackProps {
  dishOption: SignatureDishOption;
  reducedMotion?: boolean;
}

export const NonWebGLFallback: React.FC<NonWebGLFallbackProps> = ({
  dishOption,
  reducedMotion = false
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  const tiltX = reducedMotion ? 0 : -mousePos.y * 12;
  const tiltY = reducedMotion ? 0 : mousePos.x * 16;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '650px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1200px'
      }}
      aria-label="High fidelity 2.5D presentation of signature dish"
    >
      {/* Radial Warm Hearth Glow Backdrop */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${dishOption.accentLight}26 0%, rgba(20, 16, 14, 0) 70%)`,
          filter: 'blur(50px)',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.2s ease-out',
          pointerEvents: 'none'
        }}
      />

      {/* Floating 2.5D Spices & Gold Flakes */}
      {!reducedMotion && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[
            { top: '18%', left: '22%', size: '14px', delay: 0 },
            { top: '35%', right: '18%', size: '18px', delay: 1.2 },
            { bottom: '25%', left: '16%', size: '12px', delay: 2.1 },
            { bottom: '20%', right: '24%', size: '16px', delay: 0.7 },
            { top: '55%', left: '8%', size: '20px', delay: 1.8 }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              animate={{
                y: [0, -18, 0],
                rotate: [0, 45, 90],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 4 + idx,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay
              }}
              style={{
                position: 'absolute',
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                width: item.size,
                height: item.size,
                borderRadius: '50%',
                background: `radial-gradient(circle, #ffd700 30%, ${dishOption.accentLight} 80%)`,
                boxShadow: `0 0 14px ${dishOption.accentLight}`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>
      )}

      {/* Main 2.5D Dish Presentation Layer */}
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
          scale: [1, 1.015, 1]
        }}
        transition={{
          rotateX: { type: 'spring', stiffness: 100, damping: 20 },
          rotateY: { type: 'spring', stiffness: 100, damping: 20 },
          scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }}
        style={{
          position: 'relative',
          width: 'min(90vw, 560px)',
          aspectRatio: '16/9',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px ${dishOption.accentLight}26`,
          border: '1px solid rgba(245, 166, 35, 0.25)',
          transformStyle: 'preserve-3d'
        }}
      >
        <img
          src={dishOption.image || "/assets/user_paneer.jpg"}
          alt={dishOption.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Cinematic Amber Sheen Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)`,
            pointerEvents: 'none'
          }}
        />

        {/* Dish Title Overlay Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            background: 'rgba(15, 13, 12, 0.82)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            border: '1px solid rgba(245, 166, 35, 0.2)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#f5a623', letterSpacing: '0.15em' }}>
              Signature Masterpiece
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#fdfbf7' }}>
              {dishOption.name}
            </div>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f5a623' }}>
            {dishOption.price}
          </span>
        </div>
      </motion.div>

      {/* Gentle indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(20, 16, 14, 0.75)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem',
          color: '#a8a29e'
        }}
      >
        <Compass size={14} color="#f5a623" />
        <span>Interactive 2.5D Mode • Hover to tilt</span>
      </div>
    </div>
  );
};
