import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useHistory } from "react-router";
import { useEffect } from "react"; 
import axios from "axios";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const API_URL = process.env.HTTP_SERVER_URL;
const AUTH_URL = process.env.AUTH_SERVER_URL;


function Homepage() {
  const history = useHistory();

  // This useEffect hook runs once when the component loads
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        await axios.post(
          `${AUTH_URL}/refresh`,
          {}, // Empty body
          { withCredentials: true } // ESSENTIAL for sending cookies
        );

        const { data } = await axios.get(
          `${API_URL}/user/profile`,
          { withCredentials: true }
        );

        if (data) {
          localStorage.setItem("UserInfo", JSON.stringify(data));
          history.push("/chats");
        }
      } catch (error) {
        console.log("No active session found.");
      }
    };

    checkUserSession();
  }, [history]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Chat APP
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;