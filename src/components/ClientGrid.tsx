import React from 'react';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  societe: string;
  ville: string;
  pays: string;
  statut: string;
  dateConversion?: string;
}

interface ClientGridProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export default function ClientGrid({ clients = [], onEdit, onDelete }: ClientGridProps) {
  // Si aucun client n'est trouvé
  if (clients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#718096' }}>Aucun client trouvé</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px' }}>
        <tbody>
          {/* Première ligne */}
          <tr>
            {clients.slice(0, 2).map((client) => (
              <td key={client.id} style={{ width: '50%', verticalAlign: 'top' }}>
                <div style={{ 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: client.statut === 'nouveau' ? '#F0F9FF' : '#F0FFF4'
                }}>
                  {/* En-tête avec badge */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #E2E8F0'
                  }}>
                    <span style={{ 
                      backgroundColor: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {client.statut === 'nouveau' ? 'Nouveau' : 'Converti'}
                    </span>
                    
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {client.dateConversion ? new Date(client.dateConversion).toLocaleDateString() : ''}
                    </span>
                  </div>
                  
                  {/* Contenu principal */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        backgroundColor: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {client.firstName?.[0]?.toUpperCase() || ''}{client.lastName?.[0]?.toUpperCase() || ''}
                      </div>
                      
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>
                          {client.firstName} {client.lastName}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M3 21h18M5 21V7l8-4 8 4v14m-8-4v4m-9-4h18" />
                          </svg>
                          <span style={{ fontSize: '14px', color: '#718096' }}>
                            {client.societe || 'Non spécifié'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span style={{ fontSize: '14px', color: '#718096' }}>
                            {client.ville || ''}{client.pays ? `, ${client.pays}` : ''}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span style={{ fontSize: '14px', color: '#718096' }}>
                            {client.email || 'Non spécifié'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <span style={{ fontSize: '14px', color: '#718096' }}>
                            {client.phone || 'Non spécifié'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pied avec bouton */}
                  <div style={{ 
                    borderTop: '1px solid #E2E8F0', 
                    backgroundColor: '#F7FAFC',
                    padding: '8px 16px',
                    textAlign: 'center'
                  }}>
                    <button 
                      onClick={() => window.location.href = `/crm/clients/${client.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        width: '100%'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Voir les détails
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <button
                    onClick={() => onEdit(client)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #3182CE',
                      color: '#3182CE',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => onDelete(client.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #E53E3E',
                      color: '#E53E3E',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            ))}
          </tr>

          {/* Deuxième ligne (si plus de 2 clients) */}
          {clients.length > 2 && (
            <tr>
              {clients.slice(2, 4).map((client) => (
                <td key={client.id} style={{ width: '50%', verticalAlign: 'top' }}>
                  <div style={{ 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: client.statut === 'nouveau' ? '#F0F9FF' : '#F0FFF4'
                  }}>
                    {/* En-tête avec badge */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderBottom: '1px solid #E2E8F0'
                    }}>
                      <span style={{ 
                        backgroundColor: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {client.statut === 'nouveau' ? 'Nouveau' : 'Converti'}
                      </span>
                      
                      <span style={{ fontSize: '12px', color: '#718096' }}>
                        {client.dateConversion ? new Date(client.dateConversion).toLocaleDateString() : ''}
                      </span>
                    </div>
                    
                    {/* Contenu principal */}
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex' }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '50%', 
                          backgroundColor: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          {client.firstName?.[0]?.toUpperCase() || ''}{client.lastName?.[0]?.toUpperCase() || ''}
                        </div>
                        
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', marginTop: 0 }}>
                            {client.firstName} {client.lastName}
                          </p>
                          
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                              <path d="M3 21h18M5 21V7l8-4 8 4v14m-8-4v4m-9-4h18" />
                            </svg>
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {client.societe || 'Non spécifié'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {client.ville || ''}{client.pays ? `, ${client.pays}` : ''}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {client.email || 'Non spécifié'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" style={{ marginRight: '8px' }}>
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                            </svg>
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {client.phone || 'Non spécifié'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pied avec bouton */}
                    <div style={{ 
                      borderTop: '1px solid #E2E8F0', 
                      backgroundColor: '#F7FAFC',
                      padding: '8px 16px',
                      textAlign: 'center'
                    }}>
                      <button 
                        onClick={() => window.location.href = `/crm/clients/${client.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: client.statut === 'nouveau' ? '#3182CE' : '#38A169',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          width: '100%'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Voir les détails
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <button
                      onClick={() => onEdit(client)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #3182CE',
                        color: '#3182CE',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => onDelete(client.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #E53E3E',
                        color: '#E53E3E',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
