import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { loginUser, registerUser, googleLoginSimulate } from '../services/db';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let user;
      if (isRegister) {
        user = registerUser(email, password, name || 'Customer');
      } else {
        user = loginUser(email, password);
      }
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRealGoogleLogin = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // We use the decoded email and name to create a persistent session in our db mock
      const user = googleLoginSimulate(decoded.email, decoded.name);
      onLogin(user);
    } catch (err) {
      setError('Failed to process Google Login');
    }
  };



  return (
    <div className="login-container animate-on-load">
      <div className="login-card">
        <h2>{isRegister ? 'Create Account' : 'Welcome to Shree Family Restaurant'}</h2>
        <p>{isRegister ? 'Sign up to place an order' : 'Sign in to your account'}</p>
        
        {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="form-input" />
            </div>
          )}
          <div className="form-group">
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" style={{marginTop: '1rem'}}>
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{margin: '1.5rem 0', display: 'flex', alignItems: 'center', color: '#666'}}>
           <div style={{flex: 1, height: '1px', background: '#333'}}></div>
           <span style={{margin: '0 10px'}}>OR</span>
           <div style={{flex: 1, height: '1px', background: '#333'}}></div>
        </div>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <GoogleLogin
            onSuccess={handleRealGoogleLogin}
            onError={() => {
              setError('Google Login Failed');
            }}
          />
        </div>

        <div className="auth-footer" style={{marginTop: '2rem'}}>
          <p>
            {isRegister ? 'Already have an account? ' : 'New to Shree Family Restaurant? '}
            <button className="text-btn" style={{color: 'var(--color-accent)', textDecoration: 'underline'}} onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
