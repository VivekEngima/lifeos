"use client";

import React, { createContext, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  lockApp: () => {},
  unlockApp: () => true,
});

export const useAuth = () => useContext(AuthContext);

export const MASTER_PIN = "";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: true,
        lockApp: () => {},
        unlockApp: () => true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
