import React from 'react';
import { Text, Badge, Avatar } from '@mantine/core';
import { IconBuilding, IconMapPin, IconMail, IconPhone, IconEye } from '@tabler/icons-react';

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

interface ClientListSimpleProps {
  clients: Client[];
}

export default function ClientListSimple({ clients = [] }: ClientListSimpleProps) {
  // Fonction pour gérer le clic sur "Voir les détails"
  const handleViewDetails = (client: Client) => {
    // Rediriger vers la page de détails du client
    window.location.href = `/crm/clients/${client.id}`;
  };

  // Si aucun client n'est trouvé
  if (clients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Text color="dimmed">Aucun client trouvé</Text>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
        {clients.map((client) => (
          <div
            key={client.id}
            style={{
              width: 'calc(50% - 10px)',
              maxWidth: 'calc(50% - 10px)',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: client.statut === 'nouveau' ? '#F0F9FF' : '#F0FFF4'
            }}
          >
            {/* En-tête avec badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <Badge
                color={client.statut === 'nouveau' ? 'blue' : 'green'}
                variant="filled"
                size="sm"
                radius="sm"
              >
                {client.statut === 'nouveau' ? 'Nouveau' : 'Converti'}
              </Badge>

              <Text size="xs" color="dimmed">
                {client.dateConversion ? new Date(client.dateConversion).toLocaleDateString() : ''}
              </Text>
            </div>

            {/* Contenu principal */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex' }}>
                <Avatar
                  size="lg"
                  radius="xl"
                  color={client.statut === 'nouveau' ? 'blue' : 'teal'}
                  style={{ marginRight: '16px' }}
                >
                  {client.firstName?.[0]?.toUpperCase() || ''}{client.lastName?.[0]?.toUpperCase() || ''}
                </Avatar>

                <div>
                  <Text size="lg" weight={600} style={{ marginBottom: '8px' }}>
                    {client.firstName} {client.lastName}
                  </Text>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <IconBuilding size={14} color="#718096" style={{ marginRight: '8px' }} />
                    <Text size="sm" color="#718096">
                      {client.societe || 'Non spécifié'}
                    </Text>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <IconMapPin size={14} color="#718096" style={{ marginRight: '8px' }} />
                    <Text size="sm" color="#718096">
                      {client.ville || ''}{client.pays ? `, ${client.pays}` : ''}
                    </Text>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <IconMail size={14} color="#718096" style={{ marginRight: '8px' }} />
                    <Text size="sm" color="#718096">
                      {client.email || 'Non spécifié'}
                    </Text>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconPhone size={14} color="#718096" style={{ marginRight: '8px' }} />
                    <Text size="sm" color="#718096">
                      {client.phone || 'Non spécifié'}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied avec bouton */}
            <div style={{
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F7FAFC',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleViewDetails(client)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: client.statut === 'nouveau' ? '#3182CE' : '#38B2AC',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  width: '100%'
                }}
              >
                <IconEye size={14} style={{ marginRight: '8px' }} />
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
