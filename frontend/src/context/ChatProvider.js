import React, { createContext, useContext, useState, useEffect } from "react";
import { socket } from "../socket"; // import your socket instance

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [SelectedChat, setSelectedChat] = useState();
  const [User, setUser] = useState();
  const [Chats, setChats] = useState();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // connect when ChatProvider mounts
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    // cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        SelectedChat,
        setSelectedChat,
        User,
        setUser,
        Chats,
        setChats,
        socket,
        connected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
