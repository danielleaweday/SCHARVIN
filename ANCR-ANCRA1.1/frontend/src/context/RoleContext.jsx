import React, { createContext, useContext, useState, useEffect } from "react";

const RoleCtx = createContext({ role: "student", setRole: () => {} });

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("ancra_role") || "student";
  });
  useEffect(() => {
    localStorage.setItem("ancra_role", role);
  }, [role]);
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export const useRole = () => useContext(RoleCtx);
