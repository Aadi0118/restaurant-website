import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Leaf, Heart, Clock, MapPin, Phone, Mail, Award, Calendar } from 'lucide-react';
import { CategorizedMenuSection } from './CategorizedMenuSection';

interface ScrollStorySectionProps {
  onOpenReservation: () => void;
  onOpenMenu: () => void;
  onAddToCart?: (item: any) => void;
  homeMenuItems?: any[];
}

export const ScrollStorySection: React.FC<ScrollStorySectionProps> = ({
  onOpenReservation,
  onOpenMenu,
  onAddToCart,
  homeMenuItems = []
}) => {
  return (
    <div style={{ position: 'relative', zIndex: 4, background: '#0A0D0B', color: '#F7F5F0' }}>
      {/* Section 1: The Alchemy of Hearth & Gold */}
      <section
        id="alchemy"
        style={{
          padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 5vw, 5rem)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#C9A86B',
              marginBottom: '10px'
            }}
          >
            <Sparkles size={14} />
            <span>About Us</span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              margin: '0 0 1rem 0',
              fontWeight: 400,
              color: '#F7F5F0'
            }}
          >
            The Taste of Home by the Ganges
          </h2>
          <div
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #C9A86B, transparent)',
              margin: '0 auto 1.5rem auto'
            }}
          />
          <p
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              color: '#B2ADA3',
              fontSize: '1.05rem',
              lineHeight: '1.8'
            }}
          >
            Rooted in the spiritual heart of Rishikesh, Shree Restaurant is built on a simple philosophy: honest, comforting food made with devotion. We believe the best meals don't need gold leaf—they just need fresh spices, traditional recipes, and a welcoming atmosphere.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}
        >
          {[
            {
              icon: Flame,
              title: 'Authentic Indian Kitchen',
              desc: 'From our deeply spiced, slow-simmered dals to breads pulled fresh from the tandoor, every dish is a celebration of classic North Indian flavors.'
            },
            {
              icon: Leaf,
              title: 'Wholesome & Fresh',
              desc: 'We source high-quality local produce and grind our own spice blends daily to ensure every bite is vibrant and fresh.'
            },
            {
              icon: Heart,
              title: 'Heartfelt Hospitality',
              desc: "Whether you've just finished a long journey or a day by the river, our doors are open for a hearty, satisfying meal that feels like home."
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              style={{
                padding: '2.5rem 2rem',
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(23, 56, 41, 0.45) 0%, rgba(18, 24, 20, 0.85) 100%)',
                border: '1px solid rgba(201, 168, 107, 0.2)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.5)';
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 45px rgba(201, 168, 107, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.6)';
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: 'rgba(23, 56, 41, 0.6)',
                  border: '1px solid rgba(201, 168, 107, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DEC085'
                }}
              >
                <pillar.icon size={26} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: 0, color: '#F7F5F0' }}>
                {pillar.title}
              </h3>
              <p style={{ color: '#B2ADA3', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Pure Veg Categorized Menu (Collapsible & Ordered) */}
      <CategorizedMenuSection
        onAddToCart={onAddToCart}
        homeMenuItems={homeMenuItems}
        onOpenReservation={onOpenReservation}
      />

      {/* Section 3: Visit Us & Contact Section */}
      <section
        id="location"
        style={{
          padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          {/* Left Details */}
          <div>
            <div style={{ fontSize: '0.78rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A86B', marginBottom: '8px' }}>
              The Sanctuary
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', margin: '0 0 1.5rem 0', fontWeight: 400, color: '#F7F5F0' }}>
              Visit Our Botanical Salon
            </h2>
            <p style={{ color: '#B2ADA3', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              Nestled along the serene foothills of Rishikesh, our dining salon pairs ancient riverside tranquility with Michelin-caliber elevated vegetarian gastronomy.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(23, 56, 41, 0.6)', border: '1px solid rgba(201, 168, 107, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A86B' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#B2ADA3' }}>Location</div>
                  <div style={{ color: '#F7F5F0', fontSize: '0.95rem' }}>Near Royal Garden, Seema Dental AIIMS Road, IDPL Colony, Rishikesh</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(23, 56, 41, 0.6)', border: '1px solid rgba(201, 168, 107, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A86B' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#B2ADA3' }}>Service Hours</div>
                  <div style={{ color: '#F7F5F0', fontSize: '0.95rem' }}>Monday – Sunday • 11:00 AM – 11:00 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(23, 56, 41, 0.6)', border: '1px solid rgba(201, 168, 107, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A86B' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#B2ADA3' }}>Concierge & Enquiries</div>
                  <div style={{ color: '#F7F5F0', fontSize: '0.95rem' }}>(+91) 93347 22418 • shreecaferishikesh@gmail.com</div>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenReservation}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '1rem 2.2rem',
                borderRadius: '30px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                color: '#0A0D0B',
                fontWeight: 700
              }}
            >
              <Calendar size={18} />
              <span>Reserve Table for Tonight</span>
            </button>
          </div>

          {/* Right: Embedded Interactive Map with Dark Framing */}
          <div
            style={{
              height: '460px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(201, 168, 107, 0.25)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(201, 168, 107, 0.1)'
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.8770935013254!2d78.27044287414236!3d30.069057317406685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093f7fa59e6a8b%3A0x5aca904c9d08ef46!2sShree%20Family%20Restaurant!5e0!3m2!1sen!2sin!4v1788693043456!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.05) brightness(0.95)' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location Map"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(201, 168, 107, 0.15)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: '#B2ADA3',
          fontSize: '0.85rem',
          background: '#060807'
        }}
      >
        <p style={{ margin: '0 0 6px 0' }}>
          &copy; 2026 Shree Restaurant. All rights reserved.
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6A655E' }}>
          Elevated Plant-Based Gastronomie • Three.js & WebGL Architecture
        </p>
      </footer>
    </div>
  );
};

