/*package com.backend.qu2data.service;

import com.backend.qu2data.controller.MessageGroupDTO;
import com.backend.qu2data.controller.UserChatDto;
import com.backend.qu2data.entites.Attachment;
import com.backend.qu2data.entites.ConversationStatus;
import com.backend.qu2data.entites.Group;
import com.backend.qu2data.entites.GroupUser;
import com.backend.qu2data.entites.Message;
import com.backend.qu2data.entites.MessageDto;
import com.backend.qu2data.entites.Users;
import com.backend.qu2data.repository.ConversationStatusRepository;
import com.backend.qu2data.repository.GroupRepository;
import com.backend.qu2data.repository.GroupUserRepository;
import com.backend.qu2data.repository.MessageRepository;
import com.backend.qu2data.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

	 private final MessageRepository messageRepository;
	    private final UsersRepository usersRepository;
	    private final AttachmentService attachmentService;
	    private final GroupService groupService; // ✅ CORRECTION : bon nom ici
	    @Autowired
	    private ConversationStatusRepository conversationStatusRepository;
	    @Autowired
	    private KeycloakService keycloakService;

	    @Autowired
	    private GroupRepository groupRepository;

	    public MessageService(
	        MessageRepository messageRepository,
	        UsersRepository usersRepository,
	        AttachmentService attachmentService,
	        GroupService groupService // ✅ corriger aussi ici
	    ) {
	        this.messageRepository = messageRepository;
	        this.usersRepository = usersRepository;
	        this.attachmentService = attachmentService;
	        this.groupService = groupService; // ✅ CORRECTION ici aussi
	    }

	    // ... le reste du code ne change pas
	

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Message createMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public Message updateMessage(Integer id, Message newMessage) {
        return messageRepository.findById(id).map(message -> {
            message.setContent(newMessage.getContent());
            message.setIsDeleted(Optional.ofNullable(newMessage.getIsDeleted()).orElse(false));
            message.setIsUpdated(Optional.ofNullable(newMessage.getIsUpdated()).orElse(false));
            return messageRepository.save(message);
        }).orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public void deleteMessage(Integer id) {
        messageRepository.deleteById(id);
    }
    public Message markMessageAsDeleted(Integer id) {
        return messageRepository.findById(id).map(message -> {
            message.setContent("Message supprimé");
            message.setIsDeleted(true);
            return messageRepository.save(message);
        }).orElseThrow(() -> new RuntimeException("Message non trouvé"));
    }

    public List<Message> getMessagesBetweenUsers(Integer user1Id, Integer user2Id) {
        return messageRepository.findMessagesBetweenUsers(user1Id, user2Id);
    }
   
   
    public Message createMessageWithAttachment(String content, Long sentById, Long receivedById, MultipartFile file) {
        Users sender = usersRepository.findById(sentById).orElseThrow(() -> new RuntimeException("Sender not found"));
        Users receiver = usersRepository.findById(receivedById).orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setContent(content);
        message.setSentBy(sender);
        message.setReceivedBy(receiver);
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        Message savedMessage = messageRepository.save(message);

        if (file != null && !file.isEmpty()) {
            // ✅ Utilisation correcte :
            attachmentService.saveAttachment(file.getContentType(), file, savedMessage);
        }

        return savedMessage;
    


        return messageRepository.save(message);
    }

    public List<Message> getMessagesSentByUser(Integer userId) {
        return messageRepository.findBySentById(userId);
    }

    public List<Message> getMessagesReceivedByUser(Integer userId) {
        return messageRepository.findByReceivedById(userId);
    }

    public List<Message> getDeletedMessages() {
        return messageRepository.findByIsDeleted(true);
    }

    public List<Message> getUpdatedMessages() {
        return messageRepository.findByIsUpdated(true);
    }

    // ✅ Méthode utilisée pour récupérer les IDs avec qui j'ai parlé
    public List<Long> findConversationUserIds(Long currentUserId) {
        Set<Long> conversationUserIds = new HashSet<>();
        conversationUserIds.addAll(messageRepository.findDistinctSentBy(currentUserId));
        conversationUserIds.addAll(messageRepository.findDistinctReceivedBy(currentUserId));
        conversationUserIds.remove(currentUserId);
        return new ArrayList<>(conversationUserIds);
    }
    public Message sendMessageToGroup(MessageGroupDTO dto) {
        // ✅ Récupération de l'expéditeur
        Users sender = usersRepository.findById(dto.getSenderId().longValue())
            .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));

        // ✅ Récupération du groupe
        Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        // ✅ Création du message
        Message message = new Message();
        message.setSentBy(sender);
        message.setGroup(group);
        message.setContent(dto.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        // ✅ Sauvegarde du message
        return messageRepository.save(message);
    }
    public List<Group> findGroupsWithMessagesForUser(Integer userId) {
        List<Group> allGroups = groupService.getGroupsForUser(userId);
        return allGroups.stream()
            .filter(group -> !messageRepository.findByGroup_IdOrderByTimestampAsc(group.getId()).isEmpty())
            .collect(Collectors.toList());
    }


    public Message sendMessageToGroupWithFile(String content, Integer senderId, Integer groupId, MultipartFile file) {
        // Retrieve sender and group from the database
        Users sender = usersRepository.findById(senderId.longValue())
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        // Retrieve sender's full name from Keycloak using sender's id_keycloak
        String senderFullName = getSenderFullNameFromKeycloak(sender.getId_keycloak());

        // Create the message
        Message message = new Message();
        message.setSentBy(sender);
        message.setGroup(group);
        message.setContent(content);
        message.setSenderName(senderFullName);  // Set sender's full name here
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        // Handle file attachment if present
        if (file != null && !file.isEmpty()) {
            Attachment attachment = attachmentService.saveAttachment(file);
            attachment.setMessage(message);
            message.setAttachments(Collections.singletonList(attachment));
        }

        // Save the message and return it
        return messageRepository.save(message);
    }
    public String getSenderFullNameFromKeycloak(String keycloakId) {
        // Fetch the user's data from Keycloak (ensure KeycloakService is correctly fetching data)
        Map<String, Object> userData = keycloakService.getUserById(keycloakId, "YOUR_AUTH_TOKEN_HERE");
        
        // Get the firstName and lastName from the response
        String firstName = (String) userData.get("firstName");
        String lastName = (String) userData.get("lastName");
        
        // If the names are not available from Keycloak, fall back to database values
        if (firstName == null || lastName == null) {
            Users user = usersRepository.findByIdKeycloak(keycloakId).orElseThrow(() -> new RuntimeException("User not found"));
            firstName = user.getFirstName();
            lastName = user.getLastName();
        }
        
        // If the names are still missing, use a fallback value
        if (firstName == null || lastName == null) {
            return "Unknown User"; // Or some other fallback value
        }

        return firstName + " " + lastName;
    }




 
   

    public Map<Long, Integer> getUnreadPrivateMessages(Long currentUserId) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }

        Map<Long, Integer> result = new HashMap<>();
        List<Long> userIds = findConversationUserIds(currentUserId);

        for (Long otherUserId : userIds) {
            Users receiverUser = usersRepository.findById(currentUserId)
                    .orElseThrow(() -> new RuntimeException("Receiver user not found"));
            Users senderUser = usersRepository.findById(otherUserId)
                    .orElseThrow(() -> new RuntimeException("Sender user not found"));

            LocalDateTime lastReadAt = conversationStatusRepository
                    .findByUserAndOtherUser(receiverUser, senderUser)
                    .map(ConversationStatus::getLastReadAt)
                    .orElse(LocalDateTime.MIN);

            int count = messageRepository.countUnreadPrivateMessages(
                    otherUserId, currentUserId, receiverUser, lastReadAt
            );

            if (count > 0) {
                result.put(otherUserId, count);
            }
        }
        return result;
    }



    public Map<Integer, Integer> getUnreadGroupMessages(Long currentUserId) {
        Map<Integer, Integer> result = new HashMap<>();
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Group> groups = groupService.getGroupsForUser(currentUserId.intValue());

        for (Group group : groups) {
            // Récupère la dernière lecture de ce user pour ce groupe
            LocalDateTime lastReadAt = conversationStatusRepository
                .findByUserAndGroup(currentUser, group)
                .map(ConversationStatus::getLastReadAt)
                .orElse(LocalDateTime.MIN);

            // On récupère le nombre de messages non lus, en excluant les messages envoyés par l'utilisateur
            int count = messageRepository.countUnreadGroupMessagesExcludingSender(
                group.getId(), currentUser, lastReadAt, currentUser
            );

            result.put(group.getId(), count);
        }

        return result;
    }


    public void updatePrivateLastRead(Long currentUserId, String otherUserKeycloakId) {
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Users otherUser = usersRepository.findByIdKeycloak(otherUserKeycloakId)
            .orElseThrow(() -> new RuntimeException("Autre utilisateur non trouvé"));

        ConversationStatus status = conversationStatusRepository
            .findByUserAndOtherUser(currentUser, otherUser)
            .orElse(new ConversationStatus());

        status.setUser(currentUser);
        status.setOtherUser(otherUser);
        status.setLastReadAt(LocalDateTime.now());

        conversationStatusRepository.save(status);
    }
   
    
    public void updateGroupLastRead(Long currentUserId, Integer groupId) {
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        ConversationStatus status = conversationStatusRepository
            .findByUserAndGroup(currentUser, group)
            .orElse(new ConversationStatus());

        status.setUser(currentUser);
        status.setGroup(group); // ✅ ici, pas setGroupId
        status.setLastReadAt(LocalDateTime.now());

        conversationStatusRepository.save(status);
    }



    // ✅ Méthode utilisée pour récupérer les objets Users (prénom/nom)
    public List<UserChatDto> findConversationUserDtos(Long currentUserId, String bearerToken) {
        List<Long> ids = findConversationUserIds(currentUserId);
        List<Users> users = usersRepository.findAllById(ids);

        List<UserChatDto> dtos = new ArrayList<>();
        for (Users user : users) {
            Map<String, Object> keycloakUser = keycloakService.getUserById(user.getId_keycloak(), bearerToken);
            String firstName = (String) keycloakUser.get("firstName");
            String lastName = (String) keycloakUser.get("lastName");

            dtos.add(new UserChatDto(
                user.getId(),
                user.getId_keycloak(),
                firstName,
                lastName
            ));
        }
        return dtos;
    }
    
}*/
package com.backend.qu2data.service;

import com.backend.qu2data.controller.MessageGroupDTO;
import java.nio.file.Paths;
import com.backend.qu2data.entites.UserChatDto;

import com.backend.qu2data.entites.Users;

import com.backend.qu2data.controller.WebSocketMessageController;
import com.backend.qu2data.entites.*;
import com.backend.qu2data.repository.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {
	@Autowired
	private AttachmentRepository attachmentRepository; // 🔥 ajoute l'injection du repository
	@PersistenceContext
    private EntityManager entityManager;
    private final MessageRepository messageRepository;
   
    private final AttachmentService attachmentService;
    private final GroupService groupService;
    @Autowired
    private UsersRepository usersRepository;
    @Autowired
    private WebSocketMessageController webSocketMessageController;
    @Autowired
    private ConversationStatusRepository conversationStatusRepository;
    @Autowired
    private KeycloakService keycloakService;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private FileStorageService fileStorageService;
   
    
    public MessageService(
        MessageRepository messageRepository,
        UsersRepository usersRepository,
        AttachmentService attachmentService,
        GroupService groupService,
        FileStorageService fileStorageService
    ) {
        this.messageRepository = messageRepository;
        this.usersRepository = usersRepository;
        this.attachmentService = attachmentService;
        this.groupService = groupService;
        this.fileStorageService = fileStorageService;
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

   /* public Message createMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }*/
    public Message createMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        Message savedMessage = messageRepository.save(message);

        // ✅ Envoie une notification en temps réel au destinataire
        webSocketMessageController.sendPrivateNotification(
        		 savedMessage.getReceivedBy().getId().longValue(),
        	    "💬 Nouveau message de " + savedMessage.getSentBy().getFirstName()
        	);


        return savedMessage;
    }


    public Message updateMessage(Long id, Message newMessage) {
        return messageRepository.findById(id).map(message -> {
            message.setContent(newMessage.getContent());
            message.setIsDeleted(Optional.ofNullable(newMessage.getIsDeleted()).orElse(false));
            message.setIsUpdated(Optional.ofNullable(newMessage.getIsUpdated()).orElse(false));
            return messageRepository.save(message);
        }).orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }

    public Message markMessageAsDeleted(Long id) {
        return messageRepository.findById(id).map(message -> {
            message.setContent("Message supprimé");
            message.setIsDeleted(true);
            return messageRepository.save(message);
        }).orElseThrow(() -> new RuntimeException("Message non trouvé"));
    }

    public List<Message> getMessagesBetweenUsers(Integer user1Id, Integer user2Id) {
        return messageRepository.findMessagesBetweenUsers(user1Id, user2Id);
    }
    @Transactional
    public Message createMessageWithAttachment(String content, Long sentById, Long receivedById, MultipartFile file) {
        // Fetch users from the database
        Users sentBy = usersRepository.findById(sentById).orElseThrow(() -> new RuntimeException("Sender not found"));
        Users receivedBy = usersRepository.findById(receivedById).orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Create a new message
        Message message = new Message(content, sentBy, receivedBy);
        message.setTimestamp(LocalDateTime.now()); // Set timestamp to current time

        // Save the message first to ensure it has an ID
        Message savedMessage = messageRepository.save(message);

        // Now handle the file attachment if present
        if (file != null && !file.isEmpty()) {
            // Save the file and return an Attachment object
            Attachment attachment = fileStorageService.saveFile(file);

            // Associate the saved message with the attachment
            attachment.setMessage(savedMessage);  // Link attachment to the saved message

            // Save the attachment in the database
            attachmentRepository.save(attachment);

            // Optionally, update the message with the attachment
            savedMessage.setAttachments(Collections.singletonList(attachment)); // Add attachment to the message
        }

        // Return the saved message
        return savedMessage;
    }


   /* public Message sendMessageWithAttachment(Long sentById, Long receivedById, String content, MultipartFile file) {
        // Step 1: Create the message
        Users sentBy = usersRepository.findById(sentById).orElseThrow(() -> new RuntimeException("Sender not found"));
        Users receivedBy = usersRepository.findById(receivedById).orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setContent(content);
        message.setSentBy(sentBy);
        message.setReceivedBy(receivedBy);
        message.setTimestamp(LocalDateTime.now());

        // Step 2: Save the message first to ensure it gets an ID
        message = messageRepository.save(message); // Save the message first

        // Step 3: Handle file upload and attachment
        if (file != null && !file.isEmpty()) {
            Attachment attachment = fileStorageService.saveFile(file); // Save the file
            attachment.setMessage(message);  // Link attachment to the message

            // Step 4: Save the attachment to the database
            attachmentRepository.save(attachment);
        }

        return message; // Return the saved message
    }
*/



    @Transactional
    public void addAttachmentToMessage(Long messageId, MultipartFile file) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        
        if (!messageOptional.isPresent()) {
            throw new IllegalArgumentException("Message avec l'ID " + messageId + " n'existe pas.");
        }

        // Créer un attachement après la validation du message
        Message message = messageOptional.get();
        Attachment attachment = new Attachment();
        attachment.setMessage(message);
        attachment.setName(file.getOriginalFilename());
        attachment.setPath("uploads/" + file.getOriginalFilename());
        attachment.setSize((int) file.getSize());
        attachment.setType(file.getContentType());
        
        // Sauvegarder l'attachement
        attachmentRepository.save(attachment);
    }



    







        // ✅ Envoie la notification après tout
     /*   webSocketMessageController.sendPrivateNotification(
        	    receiver.getId().longValue(),
        	    "📎 Nouveau message avec pièce jointe de " + sender.getFirstName()
        	);

        return savedMessage; // ✅ et seulement après
    }
*/

    public List<Message> getMessagesSentByUser(Integer userId) {
        return messageRepository.findBySentById(userId);
    }

    public List<Message> getMessagesReceivedByUser(Integer userId) {
        return messageRepository.findByReceivedById(userId);
    }

    public List<Message> getDeletedMessages() {
        return messageRepository.findByIsDeleted(true);
    }

    public List<Message> getUpdatedMessages() {
        return messageRepository.findByIsUpdated(true);
    }

    public List<Long> findConversationUserIds(Long currentUserId) {
        if (currentUserId == null) {
            return Collections.emptyList();
        }

        Set<Long> conversationUserIds = new HashSet<>();
        conversationUserIds.addAll(messageRepository.findDistinctSentBy(currentUserId));
        conversationUserIds.addAll(messageRepository.findDistinctReceivedBy(currentUserId));
        conversationUserIds.remove(currentUserId);

        // 🚨 Ajoute cette ligne
        conversationUserIds.remove(null);

        return new ArrayList<>(conversationUserIds);
    }



    public Message sendMessageToGroup(MessageGroupDTO dto) {
        Users sender = usersRepository.findById(dto.getSenderId().longValue())
            .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));
        Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        Message message = new Message();
        message.setSentBy(sender);
        message.setGroup(group);
        message.setContent(dto.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        return messageRepository.save(message);
    }

    public List<Group> findGroupsWithMessagesForUser(Integer userId) {
        List<Group> allGroups = groupService.getGroupsForUser(userId);
        return allGroups.stream()
            .filter(group -> !messageRepository.findByGroup_IdOrderByTimestampAsc(group.getId()).isEmpty())
            .collect(Collectors.toList());
    }

    public Message sendMessageToGroupWithFile(String content, Integer senderId, Integer groupId, MultipartFile file) {
        Users sender = usersRepository.findById(senderId.longValue())
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

        String senderFullName = getSenderFullNameFromKeycloak(sender.getIdKeycloak());

        Message message = new Message();
        message.setSentBy(sender);
        message.setGroup(group);
        message.setContent(content);
        message.setSenderName(senderFullName);
        message.setTimestamp(LocalDateTime.now());
        message.setIsDeleted(false);
        message.setIsUpdated(false);

        if (file != null && !file.isEmpty()) {
            Attachment attachment = attachmentService.saveAttachment(file.getContentType(), file, message);
            attachment.setMessage(message);
            message.setAttachments(Collections.singletonList(attachment));
        }

        return messageRepository.save(message);
    }

    public String getSenderFullNameFromKeycloak(String keycloakId) {
        Map<String, Object> userData = keycloakService.getUserById(keycloakId, "YOUR_AUTH_TOKEN_HERE");
        String firstName = (String) userData.get("firstName");
        String lastName = (String) userData.get("lastName");

        if (firstName == null || lastName == null) {
            Users user = usersRepository.findByIdKeycloak(keycloakId).orElseThrow(() -> new RuntimeException("User not found"));
            firstName = user.getFirstName();
            lastName = user.getLastName();
        }

        if (firstName == null || lastName == null) {
            return "Unknown User";
        }

        return firstName + " " + lastName;
    }
    public List<Map<String, Object>> findGroupChatDtos(Integer userId) {
        List<Group> groups = groupService.getGroupsForUser(userId);
        List<Map<String, Object>> groupDtos = new ArrayList<>();

        for (Group group : groups) {
            List<Message> messages = messageRepository.findByGroupId(group.getId());
            if (!messages.isEmpty()) {
                Message lastMessage = messages.get(messages.size() - 1);
                Map<String, Object> dto = new HashMap<>();
                dto.put("type", "group");
                dto.put("groupId", group.getId());
                dto.put("name", group.getName());
                dto.put("lastMessageTime", lastMessage.getTimestamp());
                groupDtos.add(dto);
            }
        }

        return groupDtos;
    }
    public List<Map<String, Object>> findAllConversations(Long userId, String token) {
        List<UserChatDto> users = findConversationUserDtos(userId, token);
        List<Map<String, Object>> groups = findGroupChatDtos(userId.intValue());

        List<Map<String, Object>> conversations = new ArrayList<>();

        // utilisateurs
        for (UserChatDto user : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "user");
            map.put("postgresId", user.getPostgresId());
            map.put("idKeycloak", user.getIdKeycloak());
            map.put("firstName", user.getFirstName());
            map.put("lastName", user.getLastName());
            map.put("lastMessageTime", user.getLastMessageTime());
            conversations.add(map);
        }

        // groupes déjà sous forme Map
        conversations.addAll(groups);

        // tri final
        conversations.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("lastMessageTime");
            LocalDateTime timeB = (LocalDateTime) b.get("lastMessageTime");
            return timeB.compareTo(timeA);
        });

        return conversations;
    }

    public Map<Long, Integer> getUnreadPrivateMessages(Long currentUserId) {
        if (currentUserId == null) throw new IllegalArgumentException("The given id must not be null");

        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> receivedMessages = messageRepository.findByReceivedById(currentUserId.intValue());

        Map<Long, Integer> result = new HashMap<>();

        for (Message message : receivedMessages) {
            // Correction ici : comparer par ID (et pas par objet)
            boolean alreadySeen = message.getSeenBy().stream()
                .anyMatch(user -> user.getId().equals(currentUserId));

            if (!alreadySeen) {
                Long senderId = message.getSentBy().getId();
                result.put(senderId, result.getOrDefault(senderId, 0) + 1);
            }
        }

        return result;
    }

    public Map<Long, Integer> findUnreadMessageCountBySender(Long currentUserId) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }

        Users currentUser = usersRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> receivedMessages = messageRepository.findByReceivedById(currentUserId.intValue());

        Map<Long, Integer> senderUnreadCount = new HashMap<>();

        for (Message message : receivedMessages) {
            boolean alreadySeen = message.getSeenBy().stream()
                .anyMatch(user -> user.getId().equals(currentUserId));

            if (!alreadySeen) {
                Long senderId = message.getSentBy().getId();
                senderUnreadCount.put(senderId, senderUnreadCount.getOrDefault(senderId, 0) + 1);
            }
        }

        return senderUnreadCount;
    }

    public Map<Long, Integer> findMyUnseenMessagesByReceivers(Long currentUserId) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("The given id must not be null");
        }

        Users currentUser = usersRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Message> sentMessages = messageRepository.findBySentById(currentUserId.intValue());

        Map<Long, Integer> unseenMessagesByReceiver = new HashMap<>();

        for (Message message : sentMessages) {
            // 🔥 Vérifier si le message est un message privé
            if (message.getReceivedBy() == null) {
                continue; // ➔ ce message est pour un groupe, on l'ignore
            }

            Long receiverId = message.getReceivedBy().getId();

            boolean isSeen = message.getSeenBy().stream()
                .anyMatch(user -> user.getId().equals(receiverId));

            if (!isSeen) {
                unseenMessagesByReceiver.put(receiverId, unseenMessagesByReceiver.getOrDefault(receiverId, 0) + 1);
            }
        }

        return unseenMessagesByReceiver;
    }



    public void markMessagesAsSeen(Long currentUserId, Long otherUserId) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(
            currentUserId.intValue(), otherUserId.intValue()
        );

        for (Message message : messages) {
            if (message.getReceivedBy() != null && message.getReceivedBy().getId().equals(currentUserId)) {
                message.getSeenBy().add(usersRepository.findById(currentUserId)
                    .orElseThrow(() -> new RuntimeException("User not found")));
                messageRepository.save(message);
            }
        }
    }



    public Map<Integer, Integer> getUnreadGroupMessages(Long currentUserId) {
        Map<Integer, Integer> result = new HashMap<>();
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Group> groups = groupService.getGroupsForUser(currentUserId.intValue());

        for (Group group : groups) {
            LocalDateTime lastReadAt = conversationStatusRepository
                .findByUserAndGroup(currentUser, group)
                .map(ConversationStatus::getLastReadAt)
                .orElse(LocalDateTime.MIN);

            int count = messageRepository.countUnreadGroupMessagesExcludingSender(
                group.getId(), currentUser, lastReadAt, currentUser);

            result.put(group.getId(), count);
        }
        return result;
    }
  
    public void updatePrivateLastRead(Long currentUserId, String otherUserKeycloakId) {
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Users otherUser = usersRepository.findByIdKeycloak(otherUserKeycloakId)
            .orElseThrow(() -> new RuntimeException("Autre utilisateur non trouvé"));

        ConversationStatus status = conversationStatusRepository
            .findByUserAndOtherUser(currentUser, otherUser)
            .orElse(new ConversationStatus());

        status.setUser(currentUser);
        status.setOtherUser(otherUser);
        status.setLastReadAt(LocalDateTime.now());

        conversationStatusRepository.save(status);
    }

    public void updateGroupLastRead(Long currentUserId, Integer groupId) {
        Users currentUser = usersRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        ConversationStatus status = conversationStatusRepository
            .findByUserAndGroup(currentUser, group)
            .orElse(new ConversationStatus());

        status.setUser(currentUser);
        status.setGroup(group);
        status.setLastReadAt(LocalDateTime.now());

        conversationStatusRepository.save(status);
    }
    public List<UserChatDto> findConversationUserDtos(Long currentUserId, String bearerToken) {
        List<Long> ids = messageRepository.findAllUserIdsInConversationWith(currentUserId);
        List<Users> users = usersRepository.findAllById(ids);

        List<UserChatDto> dtos = new ArrayList<>();
        for (Users user : users) {
            Map<String, Object> keycloakUser = keycloakService.getUserById(user.getIdKeycloak(), bearerToken);
            String firstName = (String) keycloakUser.get("firstName");
            String lastName = (String) keycloakUser.get("lastName");

            LocalDateTime lastMsgTime = messageRepository.findLastMessageTimeBetween(currentUserId, user.getId().longValue());

            dtos.add(new UserChatDto(
                user.getId().longValue(),
                user.getIdKeycloak(),
                firstName,
                lastName,
                lastMsgTime
            ));
        }

        dtos.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));
        return dtos;
    }



    
}

