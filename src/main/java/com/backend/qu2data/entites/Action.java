package com.backend.qu2data.entites;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String managerEmail; // saisi dans le formulaire
    private String objet;
    private String statut;
    private LocalDate dateEcheance;
    private LocalDate dateRappel;
    private String description;
    private String contact;
    private Boolean isProgrammable = false;
    @ManyToOne
    @JoinColumn(name = "parent_action_id")
    @JsonIgnoreProperties({"parentAction", "prospect"})
    private Action parentAction;

    @ManyToOne
    @JoinColumn(name = "prospect_id")
    @JsonIgnoreProperties({"actions"}) // empêche les boucles infinies
    private Prospect prospect;

    // ====== Getters et Setters ======
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getManagerEmail() {
        return managerEmail;
    }

    public void setManagerEmail(String managerEmail) {
        this.managerEmail = managerEmail;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDate getDateEcheance() {
        return dateEcheance;
    }

    public void setDateEcheance(LocalDate dateEcheance) {
        this.dateEcheance = dateEcheance;
    }

    public LocalDate getDateRappel() {
        return dateRappel;
    }

    public void setDateRappel(LocalDate dateRappel) {
        this.dateRappel = dateRappel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public Prospect getProspect() {
        return prospect;
    }

    public void setProspect(Prospect prospect) {
        this.prospect = prospect;
    }

	public Boolean getIsProgrammable() {
		return isProgrammable;
	}

	public void setIsProgrammable(Boolean isProgrammable) {
		this.isProgrammable = isProgrammable;
	}

	public Action getParentAction() {
		return parentAction;
	}

	public void setParentAction(Action parentAction) {
		this.parentAction = parentAction;
	}
}
