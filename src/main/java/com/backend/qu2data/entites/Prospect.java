package com.backend.qu2data.entites;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter

@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class Prospect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ✅ Identifiant requis pour Hibernate

    @Column(name = "gestionnaire")
    private String gestionnaire; // ✅ pour refléter l’usage métier

    private String firstName;
    private String lastName;
    private String phone;
    private String secteur;
    private String societe;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    private String pays;
    private String ville;
    private String codePostal;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private Origine origine;

    public enum Origine {
        site_web, salon, reseau, autre
    }
    public enum Statut {
        nouveau, a_relancer, perdu, chaud,converti
    }
}
