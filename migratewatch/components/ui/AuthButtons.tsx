'use client';

import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

const AuthButtons = () => {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="flex gap-4 items-center">
      {isAuthenticated ? (
        <>
          <span className="text-sm text-gray-300">Welcome, {user?.name}</span>
          <LogoutButton />
        </>
      ) : (
        <LoginButton />
      )}
    </div>
  );
};

export default AuthButtons;
