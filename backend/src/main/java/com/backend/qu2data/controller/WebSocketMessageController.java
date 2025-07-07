package com.backend.qu2data.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.backend.qu2data.entites.Message;

@Controller
public class WebSocketMessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 🔔 Pour notifier un utilisateur qu’il a reçu un message privé
    public void notifyPrivateMessage(Long receiverId, Message message) {
        messagingTemplate.convertAndSend("/topic/user/" + receiverId, message);
    }

    // 🔔 Pour notifier un groupe qu’un message a été envoyé
    public void notifyGroupMessage(Integer groupId, Message message) {
        messagingTemplate.convertAndSend("/topic/group/" + groupId, message);
    }
 // 🔔 Pour envoyer juste une notification (sans envoyer tout l'objet Message)
    public void sendPrivateNotification(Long receiverId, String notificationMessage) {
        messagingTemplate.convertAndSend("/topic/notification/user/" + receiverId, notificationMessage);
    }

}
