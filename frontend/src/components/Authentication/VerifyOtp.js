// src/components/Authentication/VerifyOtp.js

import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";

const AUTH_URL = process.env.REACT_APP_AUTH_SERVER_URL;

const VerifyOtp = () => {
  const toast = useToast();
  const history = useHistory();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("registrationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email is found, redirect to signup page
      toast({
        title: "Error",
        description: "No email found for verification. Please sign up again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      history.push("/");
    }
  }, [history, toast]);

  const submitHandler = async () => {
    setLoading(true);
    if (!otp) {
      toast({
        title: "Please enter the OTP",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
        withCredentials: true,
      };
      await axios.post(
        `${AUTH_URL}/verify-otp`,
        { email, otp },
        config
      );

      toast({
        title: "Verification Successful",
        description: "Please complete your profile.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setLoading(false);
      history.push("/register"); // Navigate to profile completion page
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="otp" isRequired>
        <FormLabel>Enter OTP</FormLabel>
        <Input
          placeholder="Enter the OTP sent to your email"
          onChange={(e) => setOtp(e.target.value)}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Verify OTP
      </Button>
    </VStack>
  );
};

export default VerifyOtp;