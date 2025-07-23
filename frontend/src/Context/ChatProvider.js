import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [SelectedChat, setSelectedChat] = useState();
  const [User, setUser] = useState();
  const [Chats, setChats] = useState();

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("UserInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");
  }, [history]);

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
