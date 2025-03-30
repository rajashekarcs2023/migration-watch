import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="text-sm font-medium text-white hover:text-green-400 transition-colors"
    >
      Log In
    </button>
  );
};

export default LoginButton;
