package com.backend.qu2data.controller;

import com.backend.qu2data.entites.Attachment;
import com.backend.qu2data.entites.Group;

import com.backend.qu2data.entites.UserChatDto;

import com.backend.qu2data.entites.Message;
import com.backend.qu2data.entites.MessageDto;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.MessageRepository;
import com.backend.qu2data.repository.UsersRepository;
import com.backend.qu2data.service.FileStorageService;
import com.backend.qu2data.service.GroupService;
import com.backend.qu2data.service.KeycloakService;
import com.backend.qu2data.service.MessageService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
	@Autowired
	private WebSocketMessageController webSocketMessageController;
    private final UsersRepository usersRepository;
    private final MessageService messageService;
    private final MessageRepository messageRepository;
    private final GroupService groupService;
    private FileStorageService fileStorageService; 
    @Autowired
    private KeycloakService keycloakService;
    @Autowired
    public MessageController(UsersRepository usersRepository, MessageService messageService,
            MessageRepository messageRepository, GroupService groupService) {
this.usersRepository = usersRepository;
this.messageService = messageService;
this.messageRepository = messageRepository;
this.groupService = groupService; // <-- ✅ ici sans majuscule
}

    
    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }
    @GetMapping("/conversation-users")
    public ResponseEntity<List<UserChatDto>> getConversationUsers(
            @RequestParam Long currentUserId,
            @RequestHeader("Authorization") String authorizationHeader) {

        List<UserChatDto> userDtos = messageService.findConversationUserDtos(currentUserId, authorizationHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(userDtos);
    }

   /* @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createMessageWithAttachment(
            @RequestParam("content") String content,
            @RequestParam("sentById") Long sentById,
            @RequestParam("receivedById") Long receivedById,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            // Create the message with content, sender, and receiver
            Message message = messageService.createMessageWithAttachment(content, sentById, receivedById, file);

            // If the message has a file, save the attachment
            if (file != null) {
                Attachment attachment = fileStorageService.saveFile(file);
                message.getAttachments().add(attachment); // Link the attachment to the message
                messageRepository.save(message); // Save the message with attachment
            }

            // Send the message via WebSocket in real-time
            webSocketMessageController.notifyPrivateMessage(receivedById, message);

            return ResponseEntity.ok(message); // Respond with the created message
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }*/
   /* @PostMapping("/send-with-attachment")
    public ResponseEntity<?> sendMessageWithAttachment(
            @RequestParam Long sentById,
            @RequestParam Long receivedById,
            @RequestParam String content,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            // Appel de la méthode dans MessageService pour envoyer le message
            Message message = messageService.sendMessageWithAttachment(sentById, receivedById, content, file);

            // Retourner le message en réponse
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (Exception e) {
            // En cas d'erreur, retourner une erreur interne
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

*/
    @PostMapping
    public ResponseEntity<?> createMessage(@RequestBody MessageDto dto) {
        Users sender = usersRepository.findById(dto.getSentById().longValue())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        Users receiver = usersRepository.findById(dto.getReceivedById().longValue())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setContent(dto.getContent());
        message.setSentBy(sender);
        message.setReceivedBy(receiver);
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        Message savedMessage = messageService.createMessage(message);

        return ResponseEntity.ok(savedMessage);
    }
    @PutMapping("/delete-message/{id}")
    public ResponseEntity<Message> deleteMessage(@PathVariable Long id) {
        Message updated = messageService.markMessageAsDeleted(id);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/for-user/{userId}")
    public ResponseEntity<List<Group>> getGroupsForUser(@PathVariable Integer userId) {
        List<Group> groups = groupService.getGroupsForUser(userId);
        return ResponseEntity.ok(groups);
    }
    @GetMapping("/between-users")
    public List<Message> getMessagesBetweenUsers(@RequestParam Integer user1, @RequestParam Integer user2) {
        return messageService.getMessagesBetweenUsers(user1, user2);
    }
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupMessageDTO>> getMessagesByGroup(
        @PathVariable Integer groupId,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        // ✅ Extraire le token Bearer sans le mot "Bearer "
        String token = authorizationHeader.replace("Bearer ", "");

        // ✅ Récupérer les messages du groupe
        List<Message> messages = messageRepository.findByGroup_IdOrderByTimestampAsc(groupId);

        // ✅ Mapper les messages en DTO enrichi avec les infos Keycloak
        List<GroupMessageDTO> dtos = messages.stream().map(message -> {
            GroupMessageDTO dto = new GroupMessageDTO();
            dto.setId(message.getId());
            dto.setContent(message.getContent());
            dto.setTimestamp(message.getTimestamp());

            Users sender = message.getSentBy();
            if (sender != null) {
                dto.setSenderId(sender.getId());

                // 🔥 Appeler Keycloak pour récupérer firstName et lastName dynamiquement
                Map<String, Object> keycloakUser = keycloakService.getUserById(sender.getIdKeycloak(), token);

                String firstName = (String) keycloakUser.get("firstName");
                String lastName = (String) keycloakUser.get("lastName");

                // 🔥 Si Keycloak n'a pas de prénom/nom, fallback propre
                dto.setFirstName(firstName != null ? firstName : "Inconnu");
                dto.setLastName(lastName != null ? lastName : "Utilisateur");
            }

            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }





    @PutMapping("/{id}")
    public ResponseEntity<Message> updateMessage(@PathVariable Long id, @RequestBody Message newMessage) {
        Message updatedMessage = messageService.updateMessage(id, newMessage);
        return ResponseEntity.ok(updatedMessage);
    }
    @PostMapping(value = "/group", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendMessageToGroupWithFile(
        @RequestParam("content") String content,
        @RequestParam("sentById") Integer senderId,
        @RequestParam("groupId") Integer groupId,
        @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            Message message = messageService.sendMessageToGroupWithFile(content, senderId, groupId, file);

            // ✅ Envoi du message via WebSocket (temps réel)
            webSocketMessageController.notifyGroupMessage(groupId, message);

            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/unread/private/{currentUserId}")
    public ResponseEntity<Map<Long, Integer>> getUnreadMessagesBySender(@PathVariable Long currentUserId) {
        Map<Long, Integer> unreadMessages = messageService.findUnreadMessageCountBySender(currentUserId);
        return ResponseEntity.ok(unreadMessages);
    }



    @GetMapping("/unread/groups/{currentUserId}")
    public Map<Integer, Integer> getUnreadGroupMessages(@PathVariable Long currentUserId) {
        return messageService.getUnreadGroupMessages(currentUserId);
    }
    @PutMapping("/mark-read/private")
    public ResponseEntity<Void> markPrivateAsRead(@RequestParam Long currentUserId, @RequestParam String otherUserKeycloakId) {
        messageService.updatePrivateLastRead(currentUserId, otherUserKeycloakId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-read/group")
    public ResponseEntity<Void> markGroupAsRead(@RequestParam Long currentUserId, @RequestParam Integer groupId) {
        messageService.updateGroupLastRead(currentUserId, groupId);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/mark-as-seen")
    public ResponseEntity<Void> markMessagesAsSeen(
        @RequestParam Long currentUserId,
        @RequestParam Long otherUserId
    ) {
        messageService.markMessagesAsSeen(currentUserId, otherUserId);
        return ResponseEntity.ok().build();
    }
  
    @GetMapping("/unseen-sent/{currentUserId}")
    public ResponseEntity<Map<Long, Integer>> getMyUnseenSentMessages(@PathVariable Long currentUserId) {
        Map<Long, Integer> unseenSent = messageService.findMyUnseenMessagesByReceivers(currentUserId);
        return ResponseEntity.ok(unseenSent);
    }


}
    //////code htha shih 

    
 