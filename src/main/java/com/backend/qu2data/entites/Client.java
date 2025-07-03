package com.backend.qu2data.entites;

import jakarta.persistence.*;

import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Client extends Prospect {

    private LocalDate dateConversion;
 //   private boolean directCreation = false;

    public Client(Long id, String gestionnaire, String firstName, String lastName,
                  String phone, String secteur, String societe, String email,
                  Statut statut, String pays, String ville, String codePostal,
                  String description, Origine origine, LocalDate dateConversion,
                  boolean directCreation) {
        super(id, gestionnaire, firstName, lastName, phone, secteur, societe, email,
              statut, pays, ville, codePostal, description, origine);
        this.dateConversion = dateConversion;
       // this.directCreation = directCreation;
    }
}
