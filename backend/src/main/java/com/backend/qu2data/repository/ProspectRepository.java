package com.backend.qu2data.repository;



import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.qu2data.entites.Prospect;

public interface ProspectRepository extends JpaRepository<Prospect, Long> {
	@Query("SELECT p FROM Prospect p WHERE p.statut <> 'client'")
	List<Prospect> findAllNonClients();
	@Query("SELECT p FROM Prospect p WHERE p.statut IN ('converti', 'nouveau')")
	List<Prospect> findAllClients();
	@Query("SELECT p FROM Prospect p WHERE LOWER(p.email) = LOWER(:email)")
	Optional<Prospect> findByEmailIgnoreCase(String email);

}