import {
    Text,
    Badge,
    Button,
    Avatar,
    Card,
    Paper,
    Title,
  } from "@mantine/core";
  import { useState } from "react";
  import { IconBuilding, IconMail, IconPhone, IconMapPin, IconEye } from "@tabler/icons-react";
  import React from "react";
  import { Client } from "../../pages/crm/clients";

  interface ClientListProps {
    clients: Client[];
    onEdit: (client: Client) => void;
    onDelete: (id: number) => void;
  }

  export default function ClientList({ clients, onEdit, onDelete }: ClientListProps) {
    console.log("Clients reçus dans le composant ClientList:", clients);
    console.log("Type de clients:", typeof clients);
    console.log("Est-ce un tableau?", Array.isArray(clients));
    console.log("Nombre de clients:", clients.length);

    // Vérifier si clients est un tableau
    const clientsArray = Array.isArray(clients) ? clients : [];

    const handleShowDetails = (client: Client) => {
      // Rediriger vers la page de détails du client
      window.location.href = `/crm/clients/${client.id}`;
    };

    // Vérifier si la liste des clients est vide
    if (clientsArray.length === 0) {
      return (
        <Paper p="xl" shadow="sm" radius="md" style={{ textAlign: "center" }}>
          <Title order={3} mb="md" style={{ color: "#3E5879" }}>
            Aucun client trouvé
          </Title>
          <Text color="dimmed" mb="lg">
            Vous n'avez pas encore de clients. Convertissez des prospects en clients pour les voir apparaître ici.
          </Text>
        </Paper>
      );
    }

    return (
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        margin: 0,
        padding: 0,
        width: "100%",
        boxSizing: "border-box",
        overflow: "visible"
      }}>
        {clientsArray.map((client) => (
          <div key={client.id} style={{
            width: "calc(50% - 10px)",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
            flexGrow: 0,
            flexShrink: 0,
            minWidth: "calc(50% - 10px)",
            maxWidth: "calc(50% - 10px)"
          }}>
            <Card
              withBorder
              shadow="sm"
              radius="md"
              p={0}
              sx={{
                backgroundColor: client.statut === "nouveau" ? "#F0F9FF" : "#E6FFEC",
                borderColor: client.statut === "nouveau" ? "#E2E8F0" : "#276749",
                borderWidth: client.statut === "nouveau" ? "1px" : "2px",
                overflow: "hidden",
                width: "100%",
                maxWidth: "100%",
                boxShadow: client.statut === "converti" ? "0 0 10px rgba(39, 103, 73, 0.3)" : "none"
              }}
            >
              {/* En-tête avec badge de statut */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }}>
                <Badge
                  color={client.statut === "nouveau" ? "blue" : "green"}
                  variant="filled"
                  size="sm"
                  radius="sm"
                >
                  {client.statut === "nouveau" ? "Nouveau" : "Converti"}
                </Badge>

                {client.statut === "converti" && client.dateConversion && (
                  <Text size="xs" color="#276749" weight={600}>
                    Converti le {new Date(client.dateConversion).toLocaleDateString()}
                  </Text>
                )}
              </div>

              {/* Contenu principal */}
              <div style={{ display: "flex", padding: "12px 16px" }}>
                <Avatar
                  size="lg"
                  radius="xl"
                  color={client.statut === "nouveau" ? "blue" : "teal"}
                  style={{ marginRight: "16px" }}
                >
                  {client.firstName?.[0]?.toUpperCase() || ""}{client.lastName?.[0]?.toUpperCase() || ""}
                </Avatar>

                <div>
                  <Text
                    size="lg"
                    weight={600}
                    style={{
                      marginBottom: "5px",
                      color: client.statut === "converti" ? "#276749" : "#3E5879"
                    }}
                  >
                    {client.firstName} {client.lastName}
                    {client.statut === "converti" && (
                      <Badge
                        color="green"
                        variant="filled"
                        size="xs"
                        ml={8}
                        style={{ verticalAlign: "middle" }}
                      >
                        Converti
                      </Badge>
                    )}
                  </Text>

                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <IconBuilding
                      size={14}
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{ marginRight: "5px" }}
                    />
                    <Text
                      size="sm"
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: client.statut === "converti" ? 500 : 'normal'
                      }}
                    >
                      {client.societe || "Non spécifié"}
                    </Text>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <IconMapPin
                      size={14}
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{ marginRight: "5px" }}
                    />
                    <Text
                      size="sm"
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: client.statut === "converti" ? 500 : 'normal'
                      }}
                    >
                      {client.ville || ""}{client.pays ? `, ${client.pays}` : ""}
                    </Text>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <IconMail
                      size={14}
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{ marginRight: "5px" }}
                    />
                    <Text
                      size="sm"
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: client.statut === "converti" ? 500 : 'normal'
                      }}
                    >
                      {client.email || "Non spécifié"}
                    </Text>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconPhone
                      size={14}
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{ marginRight: "5px" }}
                    />
                    <Text
                      size="sm"
                      color={client.statut === "converti" ? "#276749" : "#718096"}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: client.statut === "converti" ? 500 : 'normal'
                      }}
                    >
                      {client.phone || "Non spécifié"}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Pied de carte avec bouton */}
              <div style={{
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F7FAFC",
                padding: "8px"
              }}>
                <Button
                  fullWidth
                  variant="subtle"
                  color={client.statut === "nouveau" ? "blue" : "teal"}
                  size="xs"
                  leftIcon={<IconEye size={14} />}
                  onClick={() => handleShowDetails(client)}
                >
                  Voir les détails
                </Button>
                <button
                  onClick={() => onEdit(client)}
                  style={{ marginRight: "10px", backgroundColor: "blue", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Supprimer
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }
