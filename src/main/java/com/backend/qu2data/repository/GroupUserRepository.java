package com.backend.qu2data.repository;


import com.backend.qu2data.entites.GroupUser;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupUserRepository extends JpaRepository<GroupUser, Integer> {
    List<GroupUser> findByGroupId(Integer groupId);
    List<GroupUser> findByUserId(Integer userId);
    List<GroupUser> findByIsAdmin(Boolean isAdmin);
    boolean existsByGroupIdAndUserId(Integer groupId, Integer userId);

    Optional<GroupUser> findByGroupIdAndUserId(Integer groupId, Integer userId);

}
