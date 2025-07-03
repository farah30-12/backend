package com.backend.qu2data.controller;
/*
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.backend.qu2data.entites.MessageDto;

@Controller
public class MessageWebSocketController {

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  @MessageMapping("/chat/sendMessage")
  public void sendMessage(@Payload MessageDto message) {
    // Save message to DB if needed
    simpMessagingTemplate.convertAndSend("/topic/messages/" + message.getReceivedById(), message);
  }
}*/