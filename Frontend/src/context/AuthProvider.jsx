import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();
export default function AuthProvider({ children }) {
  const initialAuthUser = localStorage.getItem("customer");
  const [authUser, setAuthUser] = useState(() => {
    if (initialAuthUser && initialAuthUser !== "undefined") {
      try {
        return JSON.parse(initialAuthUser);
      } catch (error) {
        console.error("Error parsing customer data:", error);
        localStorage.removeItem("customer");
        return undefined;
      }
    }
    return undefined;
  });
  
  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
