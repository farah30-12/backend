package com.backend.qu2data.repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qu2data.entites.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
}
