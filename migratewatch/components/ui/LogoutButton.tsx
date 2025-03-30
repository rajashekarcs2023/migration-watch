import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="text-sm font-medium text-white hover:text-red-400 transition-colors"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
