import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0D0B',
          color: '#F7F5F0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-sans, sans-serif)'
        }}>
          <div style={{
            maxWidth: '520px',
            padding: '2.5rem',
            background: 'rgba(18, 24, 20, 0.95)',
            border: '1px solid rgba(201, 168, 107, 0.35)',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{
              fontSize: '0.85rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C9A86B',
              marginBottom: '10px',
              fontWeight: 600
            }}>
              SHREE RESTAURANT
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '2rem', margin: '0 0 1rem 0', fontWeight: 400 }}>
              Something Went Wrong
            </h2>
            <p style={{ color: '#B2ADA3', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              An unexpected issue occurred while loading this section. You can return to the homepage or reload the application.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                color: '#0A0D0B',
                border: 'none',
                padding: '0.9rem 2.2rem',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(201, 168, 107, 0.3)'
              }}
            >
              Return to Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

