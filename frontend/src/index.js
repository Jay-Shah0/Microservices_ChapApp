// index.js
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider";
import { BrowserRouter } from "react-router-dom";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<ChakraProvider>
		<BrowserRouter>
			<ChatProvider>
				<App />
			</ChatProvider>
		</BrowserRouter>
	</ChakraProvider>
);

reportWebVitals();
