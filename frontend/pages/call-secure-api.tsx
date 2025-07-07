import React, { useState } from "react";
import { useAuth } from "src/context/AuthContext";

export default function CallSecureApi() {
  const { keycloak, isAuthenticated } = useAuth();
  const [responseData, setResponseData] = useState("");

  async function handleCallApi() {
    if (!isAuthenticated) {
      alert("Not authenticated!");
      return;
    }
  
    try {
      // Refresh the token if needed
      await keycloak?.updateToken(30);
  
      const token = keycloak?.token;
      console.log("Access Token:", token);  // Log token to check validity
  
      const res = await fetch("http://localhost:8081/api/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Request failed with status " + res.status);
      }
  
      const data = await res.text();
      setResponseData(data);
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div className="p-4">
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleCallApi}
      >
        Call Secure API
      </button>
      {responseData && (
        <p className="mt-2">
          Server response: {responseData}
        </p>
      )}
    </div>
  );
}
