'use client';

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const UserProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="text-gray-400 text-sm">Loading...</div>;
  }

  return (
    isAuthenticated && user && (
      <div className="flex items-center space-x-4 text-white text-sm">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-gray-500"
          />
        )}
        <div>
          <p>{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
    )
  );
};

export default UserProfile;
