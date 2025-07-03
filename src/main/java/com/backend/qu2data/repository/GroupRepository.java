package com.backend.qu2data.repository;


import com.backend.qu2data.entites.Group;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {
    List<Group> findByNameContaining(String name);
    List<Group> findByIsClosed(Boolean isClosed);
}
