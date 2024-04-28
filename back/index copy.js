const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid"); // For generating unique room IDs
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public")); // Serve static files from public directory

const roles = [
  "President",
  "Terrorist",
  "CIA Agent",
  "Collaborator",
  "King",
  "Resident",
];

let players = [];

let rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Create a new room
  socket.on("create room", () => {
    const roomId = uuidv4(); // Generate a unique ID for the room
    rooms[roomId] = { id: roomId, players: [socket.id] }; // Initialize room
    socket.join(roomId);
    socket.emit("room created", roomId); // Notify the creator with the room ID
    io.emit("list rooms", Object.values(rooms)); // Update all clients with new room list
  });

  socket.on("new player", (name) => {
    if (players.find((p) => p.id === socket.id)) {
      console.log("Player already registered");
    } else {
      players.push({ id: socket.id, name: name, role: null });
      console.log(`Player ${name} added to the game`);
    }
  });

  socket.on("start game", () => {
    if (players.length === 0) {
      socket.emit("error", "No players in the game");
      return;
    }

    if (socket.id === players[0].id) {
      // Check if the player who clicked is the first one joined
      assignRoles();
      io.emit("game started", players);
      console.log("Game started: roles have been assigned");
    } else {
      socket.emit("error", "Only the first player can start the game");
    }
  });

  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);
    console.log("A user disconnected", socket.id);
  });
});

function assignRoles() {
  const shuffledRoles = shuffleArray(roles.slice(0, players.length));
  players.forEach((player, index) => {
    player.role = shuffledRoles[index];
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
