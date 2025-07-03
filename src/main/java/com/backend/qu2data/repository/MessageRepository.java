package com.backend.qu2data.repository;

import com.backend.qu2data.entites.Message;
import com.backend.qu2data.entites.Users;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // 🔁 Conversation entre deux utilisateurs
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sentBy.id = :user1 AND m.receivedBy.id = :user2) OR " +
           "(m.sentBy.id = :user2 AND m.receivedBy.id = :user1) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(
        @Param("user1") Integer user1,
        @Param("user2") Integer user2
    );

    @Query("SELECT DISTINCT m.sentBy.id FROM Message m WHERE m.receivedBy.id = :currentUserId")
    List<Long> findDistinctSentBy(@Param("currentUserId") Long currentUserId);

    @Query("SELECT DISTINCT m.receivedBy.id FROM Message m WHERE m.sentBy.id = :currentUserId")
    List<Long> findDistinctReceivedBy(@Param("currentUserId") Long currentUserId);

    List<Message> findBySentById(Integer userId);
    List<Message> findByReceivedById(Integer userId);
    List<Message> findByIsDeleted(Boolean isDeleted);
    List<Message> findByIsUpdated(Boolean isUpdated);
    List<Message> findBySentBy_IdOrReceivedBy_Id(Integer sentById, Integer receivedById);
    List<Message> findByGroup_IdOrderByTimestampAsc(Integer groupId);

    // ✅ Nombre de messages non lus entre deux utilisateurs
    @Query("""
    	    SELECT COUNT(m) 
    	    FROM Message m
    	    WHERE m.receivedBy.id = :receiverId 
    	      AND m.sentBy.id = :senderId
    	      AND :receiverUser NOT MEMBER OF m.seenBy 
    	      AND m.timestamp > :lastReadAt
    	""")
    	int countUnreadPrivateMessages(
    	    @Param("receiverId") Long receiverId,
    	    @Param("senderId") Long senderId,
    	    @Param("receiverUser") Users receiverUser,
    	    @Param("lastReadAt") LocalDateTime lastReadAt
    	);

    // ✅ Nombre de messages non lus dans un groupe
 // Nombre de messages non lus dans un groupe, excluant l'expéditeur
    @Query("""
            SELECT COUNT(m) FROM Message m 
            WHERE m.group.id = :groupId 
              AND :receiverUser NOT MEMBER OF m.seenBy 
              AND m.timestamp > :lastReadAt
              AND m.sentBy != :senderUser
        """)
    int countUnreadGroupMessagesExcludingSender(
        @Param("groupId") Integer groupId,
        @Param("receiverUser") Users receiverUser,
        @Param("lastReadAt") LocalDateTime lastReadAt,
        @Param("senderUser") Users senderUser
    );
    @Query("SELECT m FROM Message m WHERE m.group.id = :groupId ORDER BY m.timestamp ASC")
    List<Message> findByGroupId(@Param("groupId") int groupId);
    @Query("SELECT DISTINCT m.receivedBy.id FROM Message m WHERE m.sentBy.id = :currentUserId")
    List<Long> findDistinctReceivedBySentById(@Param("currentUserId") Long currentUserId);

    @Query("SELECT DISTINCT m.sentBy.id FROM Message m WHERE m.receivedBy.id = :currentUserId")
    List<Long> findDistinctSentByReceivedById(@Param("currentUserId") Long currentUserId);
    @Query("""
    	    SELECT MAX(m.timestamp) FROM Message m
    	    WHERE (m.sentBy.id = :user1 AND m.receivedBy.id = :user2)
    	       OR (m.sentBy.id = :user2 AND m.receivedBy.id = :user1)
    	""")
    	LocalDateTime findLastMessageTimeBetween(
    	    @Param("user1") Long user1,
    	    @Param("user2") Long user2
    	);
    @Query("SELECT DISTINCT " +
    	       "CASE WHEN m.sentBy.id = :currentUserId THEN m.receivedBy.id " +
    	       "     ELSE m.sentBy.id END " +
    	       "FROM Message m " +
    	       "WHERE m.sentBy.id = :currentUserId OR m.receivedBy.id = :currentUserId")
    	List<Long> findAllUserIdsInConversationWith(@Param("currentUserId") Long currentUserId);

   /* List<Message> findByReceivedByIdAndIsReadFalse(Long receivedById);
    @Query("SELECT m FROM Message m WHERE m.receivedBy.id = :userId AND m.isRead = false")
    List<Message> findUnreadMessagesByUserId(@Param("userId") Long userId);
*/
    @Query("SELECT m FROM Message m WHERE :currentUser NOT MEMBER OF m.seenBy AND m.receivedBy = :currentUser")
    List<Message> findMessagesNotSeenBy(@Param("currentUser") Users currentUser);
    @Query("SELECT m FROM Message m JOIN FETCH m.sentBy WHERE m.group.id = :groupId ORDER BY m.timestamp ASC")
    List<Message> findByGroupIdWithSender(@Param("groupId") Integer groupId);

}
