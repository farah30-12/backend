import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';

// L'interface User a été supprimée car elle n'est plus utilisée

interface TaskFormProps {
  projectId: number;
  initialStatus?: string;
  onSubmit: (task: any) => void;
  onCancel: () => void;
  initialTask?: any; // Tâche initiale pour la modification
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, initialStatus = 'À faire', onSubmit, onCancel, initialTask }) => {
  const { keycloak } = useAuth();
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState(initialTask?.status || initialStatus);
  const [priority, setPriority] = useState(initialTask?.priority || 'Moyenne');

  // Initialiser les dates par défaut (aujourd'hui et dans une semaine)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const formatDateForInput = (date: Date | string) => {
    if (typeof date === 'string') {
      // Si c'est déjà une chaîne, s'assurer qu'elle est au bon format
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(initialTask?.startDate ? formatDateForInput(initialTask.startDate) : formatDateForInput(today));
  const [endDate, setEndDate] = useState(initialTask?.endDate ? formatDateForInput(initialTask.endDate) : formatDateForInput(nextWeek));



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Récupérer l'ID de l'utilisateur actuel depuis Keycloak si disponible
    const currentUserId = keycloak?.tokenParsed?.sub ?
      30 : // Remplacer par la logique pour trouver l'ID de l'utilisateur actuel
      30;

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
      // L'assignation de tâches a été supprimée
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
        <h2 style={{ marginTop: 0 }}>{initialTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</h2>
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

          {/* Le champ d'assignation de tâches a été supprimé */}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
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
              {initialTask ? 'Enregistrer les modifications' : 'Créer Tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
