import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export let globalLogout = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    console.log("AuthContext: Performing logout.");
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
