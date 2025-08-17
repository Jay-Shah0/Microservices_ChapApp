import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import VerifyOtp from "./components/Authentication/VerifyOtp";
import ChatProvider from "./context/ChatProvider";
import CompleteProfile from "./components/Authentication/CompleteProfile";


function App() {

  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/verify" component={VerifyOtp} />
      <Route path="/register" component={CompleteProfile} />
      <ChatProvider>
        <Route path="/chats" component={Chatpage} />
      </ChatProvider>
    </div>
  );
}

export default App;
