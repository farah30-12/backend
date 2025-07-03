package com.backend.qu2data.repository;




import com.backend.qu2data.entites.Attachment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    List<Attachment> findByMessageId(Integer messageId);
    List<Attachment> findByType(String type);
    List<Attachment> findByNameContaining(String keyword);
}
