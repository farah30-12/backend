// hooks/useWebSocket.ts
/*import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

type UseWebSocketProps = {
  userId: number | string; // PostgreSQL ID
  onMessage: (message: any) => void;
};

export const useWebSocket = ({ userId, onMessage }: UseWebSocketProps) => {
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws"); // 👉 remplace par ton backend
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ WebSocket connecté");
        stompClient.subscribe(`/topic/messages/${userId}`, (msg: IMessage) => {
          const data = JSON.parse(msg.body);
          onMessage(data); // callback pour traiter le message reçu
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [userId, onMessage]);
};
*/