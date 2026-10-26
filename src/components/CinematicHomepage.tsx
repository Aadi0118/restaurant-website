import React, { useState, useRef } from 'react';
import { HeroOverlay } from './ui/HeroOverlay';
import { ReservationModal } from './ui/ReservationModal';
import { MenuModal } from './ui/MenuModal';
import { ScrollStorySection } from './ui/ScrollStorySection';

interface CinematicHomepageProps {
  onAddToCart: (item: any) => void;
  onNavigateOrder?: () => void;
  homeMenuItems?: any[];
}

export const CinematicHomepage: React.FC<CinematicHomepageProps> = ({
  onAddToCart,
  onNavigateOrder,
  homeMenuItems = []
}) => {
  const [isReservationOpen, setIsReservationOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleScrollToStory = () => {
    if (storyRef.current) {
      storyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', background: '#0A0D0B', overflowX: 'hidden' }}>
      {/* Luxury Static Hero Showcase Stage */}
      <section
        style={{
          position: 'relative',
          width: '100vw',
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 75% 35%, rgba(23, 56, 41, 0.35) 0%, rgba(10, 13, 11, 0.95) 65%, #0A0D0B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Ambient Grain & Light Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(201, 168, 107, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Clean Static Hero Overlay (Headline, CTA buttons, and High-Res Dish Masterpiece) */}
        <HeroOverlay
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenReservation={() => setIsReservationOpen(true)}
          onAddToCart={onAddToCart}
        />
      </section>

      {/* Culinary Storytelling & Philosophy Sections */}
      <div ref={storyRef}>
        <ScrollStorySection
          onOpenReservation={() => setIsReservationOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
          onAddToCart={onAddToCart}
          homeMenuItems={homeMenuItems}
        />
      </div>

      {/* Reservation Dialog Modal */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />

      {/* Explore Menu Dialog Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onAddToCart={onAddToCart}
        externalMenuItems={homeMenuItems}
      />
    </div>
  );
};
