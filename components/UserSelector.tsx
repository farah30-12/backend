import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../services/api';
import { useAuth } from '../src/context/AuthContext';

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  idKeycloak?: string;
  jobTitle?: string;
}

interface UserOption {
  value: string;
  label: string;
  user: User;
}

interface UserSelectorProps {
  selectedUsers: UserOption[];
  onChange: (users: UserOption[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onChange,
  placeholder = "Rechercher un utilisateur...",
  multiple = true
}) => {
  const { keycloak } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Récupérer les utilisateurs au chargement du composant
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = keycloak?.token;
        const fetchedUsers = await userApi.getAll(token);
        console.log("Utilisateurs récupérés:", fetchedUsers);
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [keycloak]);

  // Filtrer les utilisateurs en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const jobTitle = user.jobTitle?.toLowerCase() || '';

      return firstName.includes(lowerQuery) ||
             lastName.includes(lowerQuery) ||
             fullName.includes(lowerQuery) ||
             jobTitle.includes(lowerQuery);
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formater le nom d'utilisateur pour l'affichage
  const formatUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return `Utilisateur ${user.id}`;
    }
  };

  // Vérifier si un utilisateur est déjà sélectionné
  const isUserSelected = (userId: number) => {
    return selectedUsers.some(selected => selected.value === userId.toString());
  };

  // Ajouter ou supprimer un utilisateur de la sélection
  const toggleUserSelection = (user: User) => {
    const userId = user.id.toString();
    const userName = formatUserName(user);
    
    if (isUserSelected(user.id)) {
      // Supprimer l'utilisateur de la sélection
      onChange(selectedUsers.filter(selected => selected.value !== userId));
    } else {
      // Ajouter l'utilisateur à la sélection
      const newUser: UserOption = {
        value: userId,
        label: userName,
        user: user
      };
      
      if (multiple) {
        onChange([...selectedUsers, newUser]);
      } else {
        onChange([newUser]);
        setShowDropdown(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!showDropdown) {
              setShowDropdown(true);
            }
          }}
          onClick={() => setShowDropdown(true)}
          style={{
            width: '100%',
            padding: '8px',
            paddingRight: '30px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            backgroundColor: 'white'
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            cursor: 'pointer'
          }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {showDropdown ? '▲' : '▼'}
        </span>
      </div>

      {/* Afficher les utilisateurs sélectionnés */}
      {selectedUsers.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {selectedUsers.map(selected => (
            <div
              key={selected.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e3f2fd',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '14px'
              }}
            >
              <span>{selected.label}</span>
              <button
                type="button"
                onClick={() => onChange(selectedUsers.filter(u => u.value !== selected.value))}
                style={{
                  marginLeft: '5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#6c757d',
                  padding: '0 2px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown des utilisateurs */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          zIndex: 10,
          maxHeight: '250px',
          overflowY: 'auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          marginTop: '5px'
        }}>
          {loading ? (
            <div style={{ padding: '10px', textAlign: 'center' }}>
              Chargement des utilisateurs...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center' }}>
              Aucun utilisateur trouvé
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => toggleUserSelection(user)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: isUserSelected(user.id) ? '#e9ecef' : 'transparent',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {user.firstName?.charAt(0) || user.lastName?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {formatUserName(user)}
                  </div>
                  {user.jobTitle && (
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {user.jobTitle}
                    </div>
                  )}
                </div>
                {isUserSelected(user.id) && (
                  <div style={{ marginLeft: 'auto', color: '#28a745' }}>✓</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
