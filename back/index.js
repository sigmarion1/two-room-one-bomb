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
let playersWithRole = {};

const roles = [
  "President",
  "Terrorist",
  "FBI",
  "Collaborator",
  "King",
  "Resident",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
  "Blue",
  "Red",
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function assignRoles(players, gameId) {
  const shuffledRoles = shuffleArray(roles.slice(0, players.length));

  players.forEach((player, index) => {
    player.role = shuffledRoles[index];
  });
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  io.emit("list games", Object.values(games));

  // Create a new room with a name
  socket.on("create game", ({ playerName, gameName }) => {
    if (!playerName.trim() || !gameName.trim()) {
      socket.emit("error", "Player name and game name are required.");
      return;
    }

    const playerGames = Array.from(socket.rooms).filter(
      (room) => room !== socket.id
    );

    if (playerGames.length > 0) {
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
  socket.on("join game", ({ playerName, gameId }) => {
    if (!playerName.trim()) {
      socket.emit("error", "Player name is required.");
      return;
    }

    const playerGames = Array.from(socket.rooms).filter(
      (room) => room !== socket.id
    );

    if (playerGames.length > 0) {
      socket.emit("error", "You are already in a game.");
      return;
    }

    const game = games[gameId];

    if (game === undefined) {
      socket.emit("error", "Game does not exist.");
      return;
    }

    const playerNameList = game.players.map((player) => player.name);

    if (playerNameList.includes(playerName)) {
      socket.emit("error", "Player name already exists in the game.");
      return;
    }

    game.players.push({ id: socket.id, name: playerName, isAdmin: false });
    socket.join(gameId);
    socket.emit("join game", { gameId });
    io.emit("list games", Object.values(games));
  });

  socket.on("leave game", (gameId) => {
    let game = games[gameId];

    if (game === undefined) {
      return;
    }

    player = game.players.find((player) => player.id === socket.id);

    const wasAdmin = player.isAdmin;

    game.players = game.players.filter((player) => player.id !== socket.id);
    socket.leave(gameId);

    if (game.players.length === 0) {
      delete games[gameId];
    } else if (wasAdmin) {
      game.players[0].isAdmin = true;
    }

    io.emit("list games", Object.values(games));
  });

  // Handle disconnection and remove empty rooms
  socket.on("disconnect", () => {
    const game = Object.values(games).find((game) => {
      return game.players.find((player) => player.id === socket.id);
    });

    if (game === undefined) {
      return;
    }

    player = game.players.find((player) => player.id === socket.id);

    const wasAdmin = player.isAdmin;

    game.players = game.players.filter((player) => player.id !== socket.id);
    socket.leave(game.id);

    if (game.players.length === 0) {
      delete games[game.id];
    } else if (wasAdmin) {
      game.players[0].isAdmin = true;
    }

    io.emit("list games", Object.values(games));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
