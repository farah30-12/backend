import { useAuth } from "src/context/AuthContext";
import { useState, useEffect } from "react";
import AddUserForm from "../src/components/AddUserForm";

export default function HomePage() {
  const { keycloak, isAuthenticated, login, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérification de la présence de Keycloak et des rôles
    if (keycloak && keycloak.tokenParsed?.realm_access?.roles) {
      const roles = keycloak.tokenParsed.realm_access.roles;
      const adminRole = roles.includes("admin");
      setIsAdmin(adminRole);
      console.log("Rôles:", roles);
      console.log("isAdmin:", adminRole);
    }
  }, [keycloak]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Next.js + Keycloak App</h1>

      {isAuthenticated ? (
        <div>
          <p>Welcome, {keycloak?.tokenParsed?.preferred_username}!</p>
          <p>Roles: {keycloak?.tokenParsed?.realm_access?.roles?.join(", ") || "None"}</p>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={logout}>
            Logout
          </button>

         
          {isAdmin && (
            <div className="mt-6">
              <AddUserForm />
            </div>
          )}
        </div>
      ) : (
        <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={login}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}
/*
import React from "react";
import AddUserForm from "../src/components/AddUserForm";

export default function AddUserPage() {
  return (
    <div>
      <h1>Ajouter un Utilisateur</h1>
      <AddUserForm />
    </div>
  );
}*/
