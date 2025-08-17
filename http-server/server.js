const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/DB");
const { checkDbConnection } = require("./Config/pgDB"); 
const UserRoutes = require("./Routes/UserRoutes");
const ChatRoutes = require("./Routes/ChatRoutes");
const MessageRoutes = require("./Routes/MessageRoutes");
const { notFound, errorHandler } = require("./middleware/ErrorMiddleware");
const cors = require('cors');
const http = require('http'); 

const app = express();
const server = http.createServer(app);

dotenv.config();

const Client_URL = process.env.Client_URL || "http://localhost:5173";

app.use(cors({
  origin: Client_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

checkDbConnection();
connectDB();

app.use(express.json());

app.get("/api", (req,res)=> {
  res.send("API is running successfully");
});

app.use('/api/user', UserRoutes);
app.use('/api/chats', ChatRoutes);
app.use('/api/message', MessageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
