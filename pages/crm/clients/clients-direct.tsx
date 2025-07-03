import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../src/context/AuthContext";
import MainLayout from "../../../src/components/Layout/MainLayout";

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

export default function ClientsDirectPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des clients:", err);
        setError("Impossible de charger les clients. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchClients();
  }, [getAccessToken]);

  // Filtrer les clients en fonction du terme de recherche et du filtre de statut
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm === '' ||
      client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.societe?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === null || client.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Nombre de clients par statut
  const newClientsCount = clients.filter(c => c.statut === "nouveau").length;
  const convertedClientsCount = clients.filter(c => c.statut === "converti").length;

  return (
    <MainLayout>
      <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* En-tête avec titre et statistiques */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              backgroundColor: '#EBF8FF', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginRight: '8px' 
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0', color: '#3E5879' }}>Clients</h4>
              <p style={{ margin: '0', fontSize: '14px', color: '#718096' }}>
                {clients.length} clients au total
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              padding: '8px', 
              width: '80px', 
              textAlign: 'center',
              backgroundColor: 'white'
            }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#718096', textTransform: 'uppercase' }}>
                NOUVEAUX
              </p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#3182CE' }}>
                {newClientsCount}
              </p>
            </div>
            
            <div style={{ 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              padding: '8px', 
              width: '80px', 
              textAlign: 'center',
              backgroundColor: 'white'
            }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#718096', textTransform: 'uppercase' }}>
                CONVERTIS
              </p>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#38A169' }}>
                {convertedClientsCount}
              </p>
            </div>
          </div>
        </div>
        
        {/* Filtres et recherche */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#4A5568', marginRight: '8px' }}>Filtres:</span>
            <button 
              onClick={() => setStatusFilter(null)}
              style={{ 
                backgroundColor: statusFilter === null ? '#3182CE' : 'transparent', 
                color: statusFilter === null ? 'white' : '#3182CE', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                cursor: 'pointer',
                marginRight: '4px'
              }}
            >
              Tous
            </button>
            <button 
              onClick={() => setStatusFilter('nouveau')}
              style={{ 
                backgroundColor: statusFilter === 'nouveau' ? '#3182CE' : 'transparent', 
                color: statusFilter === 'nouveau' ? 'white' : '#3182CE', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                cursor: 'pointer',
                marginRight: '4px'
              }}
            >
              Nouveaux
            </button>
            <button 
              onClick={() => setStatusFilter('converti')}
              style={{ 
                backgroundColor: statusFilter === 'converti' ? '#38A169' : 'transparent', 
                color: statusFilter === 'converti' ? 'white' : '#38A169', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                cursor: 'pointer'
              }}
            >
              Convertis
            </button>
          </div>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '6px 12px 6px 30px', 
                borderRadius: '4px', 
                border: '1px solid #E2E8F0', 
                fontSize: '14px',
                width: '200px'
              }}
            />
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#718096" 
              strokeWidth="2"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        {/* Contenu principal */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#718096' }}>Chargement des clients...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#E53E3E' }}>{error}</p>
          </div>
        ) : (
          <>
            {filteredClients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#718096' }}>
                  Aucun client ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 20px' }}>
                <tbody>
                  {/* Première ligne */}
                  <tr>
                    {filteredClients.slice(0, 2).map((client) => (
                      <td key={client.id} style={{ width: '50%', padding: '0 10px 0 0' }}>
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
                      </td>
                    ))}
                  </tr>
                  
                  {/* Deuxième ligne (si plus de 2 clients) */}
                  {filteredClients.length > 2 && (
                    <tr>
                      {filteredClients.slice(2, 4).map((client) => (
                        <td key={client.id} style={{ width: '50%', padding: '0 10px 0 0' }}>
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
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
