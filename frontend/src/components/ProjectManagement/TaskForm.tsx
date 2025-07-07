import React, { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { userApi } from 'services/api';

interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  idKeycloak?: string;
  jobTitle?: string;
}

interface TaskFormProps {
  projectId: string | number;
  initialStatus?: string;
  onSubmit: (task: any) => void;
  onClose: () => void;
  opened: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, initialStatus = 'À faire', onSubmit, onClose, opened }) => {
  // Si le formulaire n'est pas ouvert, ne rien afficher
  if (!opened) return null;
  const { keycloak } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Moyenne');
  // Initialiser les dates par défaut (aujourd'hui et dans une semaine)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(formatDateForInput(today));
  const [endDate, setEndDate] = useState(formatDateForInput(nextWeek));
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Trouver l'utilisateur sélectionné
  const selectedUser = assignedTo ? users.find(user => user.id === assignedTo) : null;

  // Référence pour le dropdown
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Récupérer l'ID de l'utilisateur actuel depuis Keycloak si disponible
    const currentUserId = keycloak?.tokenParsed?.sub ?
      users.find(u => u.idKeycloak === keycloak.tokenParsed?.sub)?.id || 30 :
      30;

    // Récupérer le nom de l'utilisateur actuel
    const currentUser = users.find(user => user.id === currentUserId);

    // Structure de tâche exactement comme celle qui fonctionne avec Postman
    const newTask = {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      // Utiliser uniquement project comme objet avec id
      project: {
        id: projectId
      },
      // Ne pas inclure projectId comme propriété séparée
      createdBy: {
        id: currentUserId
      },
      // Rendre assignedTo optionnel
      ...(assignedTo ? {
        assignedTo: {
          id: assignedTo
        }
      } : {}),
      isPersonalTodo: false
    };

    // Afficher l'ID du projet pour le débogage
    console.log("ID du projet pour la nouvelle tâche:", projectId);

    console.log("Nouvelle tâche à créer:", newTask);
    onSubmit(newTask);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>Créer une nouvelle tâche</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Titre:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                minHeight: '80px'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Statut:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Achevé">Achevé</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Priorité:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Élevée">Élevée</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date de début:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
                required
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date de fin:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Assigné à (optionnel):
            </label>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <input
                type="text"
                placeholder="Rechercher un utilisateur par nom ou prénom..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!showUserDropdown) {
                    setShowUserDropdown(true);
                  }
                }}
                onClick={() => setShowUserDropdown(true)}
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
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                {showUserDropdown ? '▲' : '▼'}
              </span>

              {selectedUser && (
                <div style={{
                  marginTop: '5px',
                  padding: '5px 10px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {selectedUser.firstName?.charAt(0) || selectedUser.lastName?.charAt(0) || '?'}
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{formatUserName(selectedUser)}</span>
                  <button
                    type="button"
                    onClick={() => setAssignedTo(null)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#6c757d'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {showUserDropdown && (
                <div style={{
                  position: 'absolute',
                  top: selectedUser ? '80px' : '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  zIndex: 10,
                  maxHeight: '250px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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
                        onClick={() => {
                          setAssignedTo(user.id);
                          setShowUserDropdown(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          cursor: 'pointer',
                          backgroundColor: assignedTo === user.id ? '#e9ecef' : 'transparent',
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
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Le champ assignedTo est maintenant optionnel */}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f8f9fa',
                color: '#212529',
                border: '1px solid #ced4da',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Créer Tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;