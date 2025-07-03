package com.backend.qu2data.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qu2data.entites.Client;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
	Optional<Client> findByEmail(String email);

    // You can add custom query methods here if needed
}
