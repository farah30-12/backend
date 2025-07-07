package com.backend.qu2data.repository;

import com.backend.qu2data.entites.Users;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {

    @Query("SELECT u FROM Users u WHERE u.idKeycloak = :idKeycloak")
    Optional<Users> findByIdKeycloak(@Param("idKeycloak") String idKeycloak);

}

