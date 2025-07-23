const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/DB");
const UserRoutes = require("./Routes/UserRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const MessageRoutes = require("./Routes/MessageRoutes");
const { notFound, errorHandler } = require("./middleware/ErrorMiddleware");
const cors = require('cors');
const http = require('http'); // Import the HTTP module
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
  }); 

app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

dotenv.config();
connectDB();

app.use(express.json());

app.get("/", (req,res)=> {
  res.send("API is running");
});

app.use('/user',UserRoutes);
app.use('/chats',ChatRoutes);
app.use('/message',MessageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  io.on('connection', (socket) => {
    console.log('A user connected',socket.id);

    socket.on('setup', (userdata) => {
      socket.join(userdata._id);
      socket.emit("connected");
    })

    //user group sockets
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;

      if (!chat.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;

        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    //chat group sockets
    socket.on("typing", (chat_id) => socket.in(chat_id).emit("typing"));
    socket.on("stop typing", (chat_id) => socket.in(chat_id).emit("stop typing"));

    socket.off("setup", () => {
      socket.leave(userData._id);
      console.log("Dissconnected")
    });
});
