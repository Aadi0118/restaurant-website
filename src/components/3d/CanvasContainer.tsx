import React, { useState, useEffect, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import { SignatureDishScene } from './SignatureDishScene';
import { NonWebGLFallback } from './NonWebGLFallback';
import { SignatureDishOption } from '../../types/dining';

interface CanvasContainerProps {
  dishOption: SignatureDishOption;
  scrollProgress: number;
}

// WebGL Error Boundary to catch any 3D rendering failures gracefully
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('WebGL Canvas encountered an issue, gracefully activating fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Elegant Loading Screen using Drei useProgress
const LuxuryLoader: React.FC = () => {
  const { progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setDisplayProgress(Math.floor(progress));
  }, [progress]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #1b1614 0%, #0d0a09 100%)',
        color: '#fdfbf7',
        pointerEvents: 'none',
        transition: 'opacity 0.6s ease'
      }}
    >
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="rgba(245, 166, 35, 0.15)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="#f5a623"
            strokeWidth="3"
            strokeDasharray={213}
            strokeDashoffset={213 - (213 * displayProgress) / 100}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            color: '#f5a623'
          }}
        >
          {displayProgress}%
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#fdfbf7',
          marginBottom: '8px'
        }}
      >
        Awakening The Hearth
      </div>
      <div style={{ fontSize: '0.85rem', color: '#a8a29e', fontStyle: 'italic' }}>
        Preparing culinary geometry & amber reflections...
      </div>
    </div>
  );
};

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  dishOption,
  scrollProgress
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Check WebGL availability & reduced motion preference
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  if (hasWebGL === false) {
    return <NonWebGLFallback dishOption={dishOption} reducedMotion={reducedMotion} />;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '650px',
        overflow: 'hidden'
      }}
    >
      <CanvasErrorBoundary fallback={<NonWebGLFallback dishOption={dishOption} reducedMotion={reducedMotion} />}>
        <Suspense fallback={<LuxuryLoader />}>
          <Canvas
            shadows
            dpr={[1, 2]} // Crisp rendering on high-DPI screens, battery conscious
            camera={{ position: [0, 1.8, 5.2], fov: 40 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: true
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: 'transparent'
            }}
          >
            <SignatureDishScene
              dishOption={dishOption}
              reducedMotion={reducedMotion}
              scrollProgress={scrollProgress}
            />
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
};
