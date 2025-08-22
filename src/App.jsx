import { useState, useEffect } from 'react';
import LoginPage from './Loginpage';
import SignupPage from './SignupPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'signup'

  // Check for invite token in URL on app load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    
    if (inviteToken) {
      // If there's an invite token, go directly to signup
      setCurrentPage('signup');
    }
  }, []);

  const switchToLogin = () => setCurrentPage('login');
  const switchToSignup = () => setCurrentPage('signup');

  if (currentPage === 'signup') {
    return <SignupPage onSwitchToLogin={switchToLogin} />;
  }

  return <LoginPage onSwitchToSignup={switchToSignup} />;
} 