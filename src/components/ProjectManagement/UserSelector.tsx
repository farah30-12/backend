import React, { useState, useEffect } from 'react';
import { MultiSelect } from '@mantine/core';
import { useAuth } from 'src/context/AuthContext';

export interface UserOption {
  value: string;
  label: string;
}

interface UserSelectorProps {
  selectedUsers: UserOption[];
  onChange: (users: UserOption[]) => void;
  placeholder?: string;
}

export default function UserSelector({
  selectedUsers,
  onChange,
  placeholder = "Sélectionner un utilisateur..."
}: UserSelectorProps) {
  const { keycloak } = useAuth();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${keycloak?.token}`,
    'Accept': 'application/json'
  });

  useEffect(() => {
    if (!keycloak?.token) return;

    setLoading(true);
    fetch("http://localhost:8081/test/keycloak/all-users", {
      headers: authHeader(),
    })
      .then((res) => res.json())
      .then((data) => {
        const transformed = data
          .filter((u: any) => u.postgresId !== null)
          .map((u: any) => {
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
            return {
              value: u.postgresId.toString(),
              label: fullName || u.username || u.email || `Utilisateur ${u.postgresId}`
            };
          });

        setUsers(transformed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement utilisateurs :", err);
        setUsers([]);
        setLoading(false);
      });
  }, [keycloak]);

  return (
    <MultiSelect
      label="Assignés à"
      data={users}
      value={selectedUsers.map(u => u.value)}
      onChange={(values) => {
        const selected = users.filter((u) => values.includes(u.value));
        onChange(selected);
      }}
      placeholder={placeholder}
      searchable
      nothingFound="Aucun utilisateur trouvé"
      disabled={loading}
      maxSelectedValues={5}
    />
  );
}
