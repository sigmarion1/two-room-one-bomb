const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let games = {};
let players = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Create a new room with a name
  socket.on("create game", ({ playerName, gameName }) => {
    if (!playerName.trim() || !gameName.trim()) {
      socket.emit("error", "Player name and game name are required.");
      return;
    }

    const games = Array.from(socket.rooms);
    if (games.length > 1) {
      socket.emit("error", "You are already in a game.");
      return;
    }

    const gameId = uuidv4();
    games[gameId] = {
      id: gameId,
      name: gameName,
      players: [{ id: socket.id, name: playerName, isAdmin: true }],
    };
    socket.join(gameId);
    // socket.emit("game created", gameId);
    socket.emit("join game", { gameId });
    io.emit("list games", Object.values(games));
    console.log("Game created", games[gameId]);
  });

  // Join an existing room with player name
  socket.on("join game", ({ gameId, playerName }) => {
    if (!playerName.trim()) {
      socket.emit("error", "Player name is required.");
      return;
    }

    const game = games[gameId];
    if (game) {
      game.players.push({ id: socket.id, name: playerName });
      socket.join(gameId);
      io.emit("list games", Object.values(games));
    } else {
      socket.emit("error", "Game does not exist");
    }
  });

  socket.on("leave game", (gameId) => {
    let game = games[gameId];
    if (game) {
      game.players = game.players.filter((player) => player.id !== socket.id);
      socket.leave(gameId);
      // io.to(gameId).emit("update game", game); // Notify remaining players in the room
      if (game.players.length === 0) {
        delete games[gameId]; // Delete the room if no players are left
      }
      io.emit("list games", Object.values(games)); // Update the room list globally
    }
  });

  // Handle disconnection and remove empty rooms
  socket.on("disconnect", () => {
    Object.keys(games).forEach((gameId) => {
      let game = games[gameId];
      game.players = game.players.filter((player) => player.id !== socket.id);
      if (game.players.length === 0) {
        delete games[gameId];
      }
    });
    io.emit("list games", Object.values(games));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
