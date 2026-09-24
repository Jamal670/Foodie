import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export let globalLogout = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    console.log("AuthContext: Performing logout.");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    setUser(null);
  };

  globalLogout = logout;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
