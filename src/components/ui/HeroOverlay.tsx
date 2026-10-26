import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Sparkles, Utensils, Calendar, Award, ShieldCheck, Clock, ChevronLeft, ChevronRight, ShoppingBag, Check, Flame } from 'lucide-react';
import { FEATURED_DISHES } from '../../constants/featuredDishes';

interface HeroOverlayProps {
  onOpenMenu: () => void;
  onOpenReservation: () => void;
  reducedMotion?: boolean;
  onAddToCart?: (item: any) => void;
}

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  onOpenMenu,
  onOpenReservation,
  reducedMotion = false,
  onAddToCart
}) => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const autoPlayTimerRef = useRef<number | null>(null);

  const currentDish = FEATURED_DISHES[currentDishIndex] || FEATURED_DISHES[0];

  // Automatic dish cycling every 4.2 seconds (pauses on mouse hover)
  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setCurrentDishIndex((prev) => (prev + 1) % FEATURED_DISHES.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrevDish = () => {
    setCurrentDishIndex((prev) => (prev - 1 + FEATURED_DISHES.length) % FEATURED_DISHES.length);
  };

  const handleNextDish = () => {
    setCurrentDishIndex((prev) => (prev + 1) % FEATURED_DISHES.length);
  };

  const handleQuickAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: currentDish.id,
        name: currentDish.name,
        price: currentDish.price,
        desc: currentDish.description,
        category: currentDish.category || 'Specialty'
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      onOpenMenu();
    }
  };
  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.15,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(1.5rem, 4vw, 3.5rem)',
        paddingTop: '90px', // Space for fixed navbar
        boxSizing: 'border-box',
        zIndex: 10
      }}
    >
      {/* Top Accolade Bar */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
          marginBottom: '2rem'
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 18px',
            borderRadius: '20px',
            background: 'rgba(18, 24, 20, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201, 168, 107, 0.3)',
            fontSize: '0.78rem',
            color: '#C9A86B',
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}
        >
          <Award size={15} />
          <span>Michelin Guide Selection • Rishikesh Hearth</span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 18px',
            borderRadius: '20px',
            background: 'rgba(18, 24, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: '#B2ADA3',
            letterSpacing: '0.08em'
          }}
        >
          <Clock size={14} color="#C9A86B" />
          <span>Dinner Service: 18:00 – 23:30 • Reservations Required</span>
        </motion.div>
      </motion.div>

      {/* Main Two-Column Hero Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          alignItems: 'center',
          gap: 'clamp(2rem, 5vw, 4.5rem)',
          width: '100%',
          maxWidth: '1360px',
          margin: 'auto 0'
        }}
      >
        {/* Left Column: Brand & Dining Narrative */}
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Subtle Tagline */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#C9A86B',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={14} />
            <span>Fine Pure Vegetarian Dining • Handcrafted Flavors</span>
          </motion.div>

          {/* Main Cinematic Title */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.8rem, 5.8vw, 5rem)',
              lineHeight: 1.05,
              fontWeight: 400,
              color: '#F7F5F0',
              margin: '0 0 1.2rem 0',
              textShadow: '0 8px 30px rgba(0,0,0,0.8)'
            }}
          >
            SHREE
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(1.3rem, 2.5vw, 2.1rem)',
                fontStyle: 'italic',
                color: '#DEC085',
                marginTop: '6px',
                fontWeight: 300,
                letterSpacing: '0.06em'
              }}
            >
              Restaurant
            </span>
          </motion.h1>

          {/* Editorial Philosophy Description */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: 'clamp(1.05rem, 1.25vw, 1.2rem)',
              lineHeight: 1.8,
              color: '#C5BFB5',
              marginBottom: '1.8rem',
              maxWidth: '580px',
              textShadow: '0 2px 10px rgba(0,0,0,0.6)'
            }}
          >
            Savor <span style={{ color: '#F7F5F0', fontWeight: 600 }}>pure vegetarian indulgence</span> by the Himalayan foothills—
            <span style={{ color: '#DEC085', fontWeight: 500 }}>slow-cooked heritage recipes</span>, aromatic whole spices, and heartfelt comfort in every dish.
          </motion.p>

          {/* Key Culinary Highlights */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '2.4rem'
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(23, 56, 41, 0.65)',
                border: '1px solid rgba(201, 168, 107, 0.3)',
                fontSize: '0.78rem',
                color: '#DEC085',
                letterSpacing: '0.06em'
              }}
            >
              <ShieldCheck size={14} color="#C9A86B" />
              100% Fine-Dining Vegetarian
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(18, 24, 20, 0.8)',
                border: '1px solid rgba(201, 168, 107, 0.25)',
                fontSize: '0.78rem',
                color: '#F7F5F0',
                letterSpacing: '0.06em'
              }}
            >
              <Flame size={14} color="#C9A86B" />
              Traditional North Indian Rasoi
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(18, 24, 20, 0.8)',
                border: '1px solid rgba(201, 168, 107, 0.25)',
                fontSize: '0.78rem',
                color: '#F7F5F0',
                letterSpacing: '0.06em'
              }}
            >
              <Sparkles size={14} color="#DEC085" />
              Authentic Himalayan Spices
            </span>
          </motion.div>

          {/* High-Contrast CTAs */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <button
              onClick={onOpenReservation}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '1.15rem 2.5rem',
                fontSize: '0.95rem',
                borderRadius: '35px',
                color: '#0A0D0B',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #C9A86B 0%, #DEC085 100%)',
                boxShadow: '0 8px 30px rgba(201, 168, 107, 0.38)',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(201, 168, 107, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(201, 168, 107, 0.38)';
              }}
            >
              <Calendar size={18} />
              <span>Reserve a Table</span>
            </button>

            <button
              onClick={onOpenMenu}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '1.15rem 2.3rem',
                fontSize: '0.95rem',
                borderRadius: '35px',
                border: '1px solid rgba(201, 168, 107, 0.45)',
                color: '#F7F5F0',
                background: 'rgba(18, 24, 20, 0.85)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C9A86B';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(201, 168, 107, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.45)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Utensils size={18} color="#C9A86B" />
              <span>Explore Tasting Menu</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: Dynamic Automatic Rotating Dish Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {/* Ambient Warm Hearth Halo matching active dish accent */}
          <div
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${currentDish.accentColor || '#C9A86B'}25 0%, rgba(23, 56, 41, 0.15) 50%, transparent 75%)`,
              filter: 'blur(55px)',
              pointerEvents: 'none',
              zIndex: 0,
              transition: 'background 0.8s ease'
            }}
          />

          {/* Masterpiece Showcase Presentation Card */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              borderRadius: '26px',
              overflow: 'hidden',
              background: 'rgba(18, 24, 20, 0.92)',
              border: '1px solid rgba(201, 168, 107, 0.38)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 45px rgba(201, 168, 107, 0.18)',
              zIndex: 1,
              transition: 'transform 0.4s ease, box-shadow 0.4s ease'
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* High-Resolution Auto-Rotating Dish Image Stage */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/11',
                overflow: 'hidden',
                background: '#0B0F0C'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentDish.id}
                  src={currentDish.image}
                  alt={currentDish.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </AnimatePresence>

              {/* Gentle Vignette Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 13, 11, 0.94) 0%, rgba(10, 13, 11, 0.2) 50%, rgba(0, 0, 0, 0.25) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Left Badge & Dish Counter */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 2
                }}
              >
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(10, 13, 11, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(201, 168, 107, 0.45)',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: '#DEC085',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                  }}
                >
                  {currentDish.tag}
                </div>
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: '20px',
                    background: 'rgba(10, 13, 11, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.68rem',
                    color: '#C9A86B',
                    letterSpacing: '0.08em'
                  }}
                >
                  0{currentDishIndex + 1} / 0{FEATURED_DISHES.length}
                </div>
              </div>

              {/* Price Tag with Glowing Gold Accent */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  padding: '7px 18px',
                  borderRadius: '20px',
                  background: 'rgba(23, 56, 41, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(201, 168, 107, 0.55)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#F7F5F0',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ color: '#C9A86B', fontSize: '0.9rem' }}>₹</span>
                <span>{currentDish.price}</span>
              </div>

              {/* Prev & Next Floating Navigation Arrows */}
              <button
                onClick={handlePrevDish}
                aria-label="Previous dish"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(10, 13, 11, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(201, 168, 107, 0.35)',
                  color: '#F7F5F0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease',
                  zIndex: 3
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 107, 0.9)';
                  e.currentTarget.style.color = '#0A0D0B';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(10, 13, 11, 0.75)';
                  e.currentTarget.style.color = '#F7F5F0';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNextDish}
                aria-label="Next dish"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(10, 13, 11, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(201, 168, 107, 0.35)',
                  color: '#F7F5F0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease',
                  zIndex: 3
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 168, 107, 0.9)';
                  e.currentTarget.style.color = '#0A0D0B';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(10, 13, 11, 0.75)';
                  e.currentTarget.style.color = '#F7F5F0';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight size={20} />
              </button>

              {/* Subtle Auto-Rotation Progress Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 3
                }}
              >
                <motion.div
                  key={currentDish.id + (isPaused ? '-paused' : '-running')}
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? '100%' : '100%' }}
                  transition={{ duration: isPaused ? 0 : 4.2, ease: 'linear' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #C9A86B, #DEC085)',
                    opacity: isPaused ? 0.4 : 1
                  }}
                />
              </div>
            </div>

            {/* Dish Culinary Editorial Caption Card */}
            <div style={{ padding: '22px 24px 24px 24px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDish.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px'
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.5rem',
                        color: '#F7F5F0',
                        letterSpacing: '0.02em',
                        fontWeight: 400
                      }}
                    >
                      {currentDish.name}
                    </div>

                    <button
                      onClick={handleQuickAdd}
                      className="btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '18px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        background: justAdded ? '#27AE60' : 'rgba(201, 168, 107, 0.15)',
                        color: justAdded ? '#FFFFFF' : '#DEC085',
                        border: justAdded ? '1px solid #27AE60' : '1px solid rgba(201, 168, 107, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        if (!justAdded) {
                          e.currentTarget.style.background = '#C9A86B';
                          e.currentTarget.style.color = '#0A0D0B';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!justAdded) {
                          e.currentTarget.style.background = 'rgba(201, 168, 107, 0.15)';
                          e.currentTarget.style.color = '#DEC085';
                        }
                      }}
                    >
                      {justAdded ? (
                        <>
                          <Check size={14} /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Order • ₹{currentDish.price}
                        </>
                      )}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: '#DEC085',
                      marginBottom: '10px',
                      fontWeight: 400
                    }}
                  >
                    {currentDish.subtitle}
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      lineHeight: 1.6,
                      color: '#B2ADA3',
                      margin: 0
                    }}
                  >
                    {currentDish.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Interactive Thumbnail Selector Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}
              >
                {FEATURED_DISHES.map((dish, idx) => {
                  const isActive = idx === currentDishIndex;
                  return (
                    <button
                      key={dish.id}
                      onClick={() => setCurrentDishIndex(idx)}
                      style={{
                        flex: '1 1 0',
                        minWidth: '120px',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        background: isActive ? 'rgba(201, 168, 107, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        border: isActive ? '1px solid #C9A86B' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        transition: 'all 0.25s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                          e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#F7F5F0' : '#B2ADA3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%'
                        }}
                      >
                        {dish.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: isActive ? '#C9A86B' : '#7D786F',
                          fontWeight: 600,
                          marginTop: '2px'
                        }}
                      >
                        ₹{dish.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Empty bottom spacer to ensure clean spacing without clutter */}
      <div style={{ height: '10px' }} />
    </div>
  );
};
