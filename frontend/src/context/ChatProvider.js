import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [SelectedChat, setSelectedChat] = useState();
  const [User, setUser] = useState();
  const [Chats, setChats] = useState();

  return (
    <ChatContext.Provider
      value={{
        SelectedChat,
        setSelectedChat,
        User,
        setUser,
        Chats,
        setChats,
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
