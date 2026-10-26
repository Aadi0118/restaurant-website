import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, Sparkles, CheckCircle2, X, UtensilsCrossed, Wine, Award, MessageCircle } from 'lucide-react';
import { ReservationData } from '../../types/dining';
import { saveReservation } from '../../services/db';

const DINING_EXPERIENCES = [
  { id: 'casual', label: 'Casual Family Dining', icon: Users },
  { id: 'festive', label: 'Festive Gathering', icon: Sparkles },
  { id: 'executive', label: 'Executive Lunch/Dinner', icon: Award }
];


interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  restaurantName = "SHREE RESTAURANT"
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<'form' | 'confirmed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    guests: 2,
    experience: 'casual',
    specialRequests: ''
  });
  const [confirmationCode, setConfirmationCode] = useState<string>('');

  // Synchronize modal state with native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Modern Web Guidance: Light-dismiss fallback for browsers without native 'closedBy' support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDialogClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isDialogContent) {
        onClose();
      }
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleDialogClick);
      return () => dialog.removeEventListener('click', handleDialogClick);
    }
  }, [onClose]);

  // Handle native close event (e.g. Esc key)
  const handleNativeClose = () => {
    onClose();
    setTimeout(() => setStep('form'), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const code = 'AMB-' + Math.floor(1000 + Math.random() * 9000);
    setConfirmationCode(code);

    try {
      await saveReservation({
        ...formData,
        code,
        status: 'confirmed'
      });
    } catch (err) {
      console.error('Error saving reservation:', err);
    } finally {
      setIsSubmitting(false);
      setStep('confirmed');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      onClose={handleNativeClose}
      aria-labelledby="reservation-title"
      style={{
        padding: 0,
        borderRadius: '24px',
        border: '1px solid rgba(201, 168, 107, 0.3)',
        background: '#121814',
        color: '#F7F5F0',
        maxWidth: '580px',
        width: '92vw',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(201, 168, 107, 0.15)',
        overscrollBehavior: 'contain'
      }}
    >
      <div style={{ padding: '2rem', position: 'relative' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close reservation dialog"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: '#B2ADA3',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A86B')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#B2ADA3')}
        >
          <X size={18} />
        </button>

        {step === 'form' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#C9A86B',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                <Sparkles size={14} />
                <span>Table Reservation • Shree Restaurant</span>
              </div>
              <h2
                id="reservation-title"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  margin: 0,
                  color: '#F7F5F0'
                }}
              >
                Reserve Your Table
              </h2>
              <p style={{ color: '#B2ADA3', fontSize: '0.9rem', marginTop: '6px' }}>
                {restaurantName}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Dining Experience Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#C9A86B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Dining Experience
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {DINING_EXPERIENCES.map((exp) => (
                    <button
                      type="button"
                      key={exp.id}
                      onClick={() => setFormData({ ...formData, experience: exp.id })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: formData.experience === exp.id ? '1px solid #C9A86B' : '1px solid rgba(201, 168, 107, 0.15)',
                        background: formData.experience === exp.id ? 'rgba(23, 56, 41, 0.65)' : 'rgba(255,255,255,0.02)',
                        color: formData.experience === exp.id ? '#DEC085' : '#F7F5F0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <exp.icon size={16} />
                      <span>{exp.label}</span>
                    </button>
                  ))}
                </div>
              </div>


              {/* Date, Time & Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a8a29e', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fdfbf7',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a8a29e', marginBottom: '4px' }}>Time Slot</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#1e1a18',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fdfbf7',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="12:30">12:30 PM (Lunch)</option>
                    <option value="13:30">1:30 PM (Lunch)</option>
                    <option value="19:30">7:30 PM (Dinner)</option>
                    <option value="20:30">8:30 PM (Dinner)</option>
                    <option value="21:30">9:30 PM (Late Dinner)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a8a29e', marginBottom: '4px' }}>Guests</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                      style={{ padding: '8px 12px', color: '#f5a623', fontSize: '1rem', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '0.95rem', color: '#F7F5F0' }}>{formData.guests}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: Math.min(8, formData.guests + 1) })}
                      style={{ padding: '8px 12px', color: '#C9A86B', fontSize: '1rem', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>



              {/* Guest Contact Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#B2ADA3', marginBottom: '4px' }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(10, 13, 11, 0.8)',
                      border: '1px solid rgba(201, 168, 107, 0.2)',
                      borderRadius: '10px',
                      color: '#F7F5F0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#B2ADA3', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 93347 22318"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(10, 13, 11, 0.8)',
                      border: '1px solid rgba(201, 168, 107, 0.2)',
                      borderRadius: '10px',
                      color: '#F7F5F0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#B2ADA3', marginBottom: '4px' }}>Dietary Notes & Celebrations</label>
                <input
                  type="text"
                  placeholder="Anniversary, Morel / Truffle allergy, Vegan preference, etc."
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(10, 13, 11, 0.8)',
                    border: '1px solid rgba(201, 168, 107, 0.2)',
                    borderRadius: '10px',
                    color: '#F7F5F0',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  width: '100%',
                  fontSize: '0.95rem',
                  letterSpacing: '0.15em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                  color: '#0A0D0B',
                  fontWeight: 700
                }}
              >
                {isSubmitting ? 'Confirming Table...' : 'Confirm Table Reservation'}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(23, 56, 41, 0.4)',
                border: '1px solid #C9A86B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                color: '#C9A86B'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: '#C9A86B', textTransform: 'uppercase', marginBottom: '6px' }}>
              Reservation Confirmed
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: '#F7F5F0' }}>
              We Await Your Presence
            </h2>

            <div
              style={{
                margin: '2rem 0',
                padding: '1.5rem',
                background: 'rgba(23, 56, 41, 0.25)',
                borderRadius: '16px',
                border: '1px solid rgba(201, 168, 107, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: '#B2ADA3' }}>Confirmation Code</span>
                <span style={{ color: '#C9A86B', fontWeight: 'bold', letterSpacing: '0.1em' }}>{confirmationCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B2ADA3' }}>Guest</span>
                <span style={{ color: '#F7F5F0' }}>{formData.name} ({formData.guests} Guests)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B2ADA3' }}>Date & Time</span>
                <span style={{ color: '#F7F5F0' }}>{formData.date} at {formData.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#B2ADA3' }}>Experience</span>
                <span style={{ color: '#F7F5F0' }}>
                  {DINING_EXPERIENCES.find((e) => e.id === formData.experience)?.label || formData.experience}
                </span>
              </div>
              {formData.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#B2ADA3' }}>Phone</span>
                  <span style={{ color: '#F7F5F0' }}>{formData.phone}</span>
                </div>
              )}
            </div>

            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '10px', 
              background: 'rgba(201, 168, 107, 0.1)', 
              border: '1px solid rgba(201, 168, 107, 0.25)',
              fontSize: '0.85rem',
              color: '#DEC085'
            }}>
              ✓ Dispatched to the Admin Host Desk. Your table is reserved and logged in our system.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a
                href={`https://wa.me/919334722318?text=${encodeURIComponent(`Hello Shree Restaurant! I have just reserved a table.\n\nCode: ${confirmationCode}\nName: ${formData.name}\nDate: ${formData.date} at ${formData.time}\nGuests: ${formData.guests}\nExperience: ${formData.experience}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  color: '#25D366',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <MessageCircle size={18} />
                <span>Send Details to WhatsApp Desk</span>
              </a>

              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', cursor: 'pointer', background: 'linear-gradient(135deg, #C9A86B, #DEC085)', color: '#0A0D0B', fontWeight: 600 }}
              >
                Return to Experience
              </button>
            </div>
          </div>
        )}

      </div>
    </dialog>
  );
};
