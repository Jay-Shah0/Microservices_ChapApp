import React, { useEffect, useRef, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { socket } from '../socket';
import {
  Box,
  FormControl,
  IconButton,
  Spinner,
  Text,
  useToast,
  useBreakpointValue,
  Textarea,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowRightIcon } from '@chakra-ui/icons';
import TextareaAutosize from 'react-textarea-autosize';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from './MessagesScroll';
import axios from 'axios';
import { useCallback } from 'react';

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
  const { SelectedChat, setSelectedChat, User } = ChatState();

  const [Messages, setMessages] = useState([]);
  const [loading, setloading] = useState(true);
  const [NewMessage, setNewMessage] = useState("");
  const [SocketConnected, setSocketConnected] = useState(false);
  const [Typing, setTyping] = useState(false);
  const [Istyping, setIstyping] = useState(false);
  const toast = useToast();
  const [PreviousChatId, setPreviousChatId] = useState("");

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textareaRef = useRef(null);

  const StatusUpdate = useCallback(async () => {
		if (!SelectedChat) return;

		try {
			const config = {
				headers: {
					"Content-type": "application/json",
					Authorization: `Bearer ${User.token}`,
				},
			};
			await axios.put(
				"http://localhost:5000/message/readressage",
				{ chatId: SelectedChat },
				config
			);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to Update Status",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	}, [SelectedChat, User.token, toast]);
  

  const FetchMessages = useCallback(async () => {
		if (!SelectedChat) return;

		try {
			const config = { headers: { Authorization: `Bearer ${User.token}` } };
			setloading(true);
			const { data } = await axios.get(
				`http://localhost:5000/message/${SelectedChat._id}`,
				config
			);
			setMessages(data);
			setloading(false);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to Load the Messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}

		StatusUpdate();
	}, [SelectedChat, User.token, StatusUpdate, toast]);
  

  const SendMessage = async () => {
    try {
      setTyping(false);
      socket.emit('stop typing', SelectedChat._id);
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${User.token}`,
        },
      };
      const { data } = await axios.post(
        'http://localhost:5000/message',
        { content: NewMessage, chatId: SelectedChat },
        config
      );
      setNewMessage('');
      setMessages([...Messages, data]);
      socket.emit('new message', data);
      textareaRef.current?.focus();
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to send the Message',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  const handleKeyDown = (event) => {
    if (!isMobile && event.key === 'Enter') {
      if (event.shiftKey) {
        // allow newline
        return;
      }
      event.preventDefault();
      if (NewMessage.trim()) SendMessage();
    }
  };

  const handleSendMessage = () => {
    if (NewMessage.trim()) SendMessage();
  };

  const TypingHandler = (message) => {
    if (!SocketConnected) return;
    setNewMessage(message);
    setTyping(true);
    socket.emit('typing', SelectedChat._id);
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && Typing) {
        socket.emit('stop typing', SelectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    socket.emit('setup', User);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIstyping(true));
    socket.on('stop typing', () => setIstyping(false));
    return () => {
      socket.off('connected');
    };
  }, [User]);

  useEffect(() => {
    FetchMessages();
    if (SelectedChat && SelectedChat._id !== PreviousChatId) {
      socket.emit('join chat', SelectedChat._id);
    }
    if (PreviousChatId) socket.emit('leave chat', PreviousChatId);

    setPreviousChatId(SelectedChat?._id || "");
    return () => {
      if (SelectedChat) socket.emit('leave chat', SelectedChat._id);
    };
  }, [FetchMessages, PreviousChatId, SelectedChat]);

  useEffect(() => {
    socket.on('message recieved', (newMessageRecieved) => {
      if (!SelectedChat || SelectedChat._id !== newMessageRecieved.chat._id) return;
      setMessages([...Messages, newMessageRecieved]);
    });
  }, [Messages, SelectedChat, StatusUpdate]);

  return (
    <>
      {SelectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Work sans'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!SelectedChat.isGroupChat ? (
              <>
                {getSender(User, SelectedChat.users)}
                <ProfileModal user={getSenderFull(User, SelectedChat.users)} />
              </>
            ) : (
              <>
                {SelectedChat.chatName}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setfetchAgain={setfetchAgain}
                />
              </>
            )}
          </Text>

          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            {loading ? (
              <Spinner size='xl' w={20} h={20} alignSelf='center' margin='auto' />
            ) : (
              <div className='messages'>
                <ScrollableChat
                  Messages={Messages}
                  isGroupChat={SelectedChat.isGroupChat}
                />
              </div>
            )}

            <FormControl mt={3} isRequired onKeyDown={handleKeyDown}>
              {Istyping && <Text>Typing...</Text>}
              <Box display='flex' alignItems='flex-end'>
                <Textarea
                  as={TextareaAutosize}
                  ref={textareaRef}
                  value={NewMessage}
                  onChange={(e) => TypingHandler(e.target.value)}
                  placeholder='Enter a message...'
                  bg='#E0E0E0'
                  resize='none'
                  minRows={1}
                  maxRows={6}
                  flex='1'
                  pr={2}
                />
                <IconButton
                  icon={<ArrowRightIcon />}
                  onClick={handleSendMessage}
                  ml={2}
                  isDisabled={!NewMessage.trim()}
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box>
          <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;