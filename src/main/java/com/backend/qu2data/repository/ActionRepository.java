package com.backend.qu2data.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.qu2data.entites.Action;

public interface ActionRepository extends JpaRepository<Action, Long> {
	List<Action> findByIsProgrammableTrue();
	void deleteByProspectId(Long prospectId);
}
