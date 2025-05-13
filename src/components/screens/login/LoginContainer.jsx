import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { loginWithGoogle } from '../../../store/auth/authActions';
import LoginView from './LoginView';

const LoginContainer = ({ loginWithGoogle }) => {
  const navigate = useHistory();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate.push('/tasks');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      navigate.push('/tasks');
    }
  }, [navigate]);

  return <LoginView onGoogleSignIn={handleGoogleSignIn} />;
};

const mapDispatchToProps = {
  loginWithGoogle,
};

export default connect(null, mapDispatchToProps)(LoginContainer);
