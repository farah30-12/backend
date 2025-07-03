package com.backend.qu2data.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.qu2data.entites.ConversationStatus;
import com.backend.qu2data.entites.Group;
import com.backend.qu2data.entites.Users;


    public interface ConversationStatusRepository extends JpaRepository<ConversationStatus, Long> {
        Optional<ConversationStatus> findByUserIdAndOtherUserId(Long userId, Long otherUserId);
        Optional<ConversationStatus> findByUserIdAndGroupId(Long userId, Integer groupId);
        Optional<ConversationStatus> findByUserAndOtherUser(Users user, Users otherUser);
        Optional<ConversationStatus> findByUserAndGroup(Users user, Group group);

    }
    



