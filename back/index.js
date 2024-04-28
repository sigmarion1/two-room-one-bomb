const express = require("express");
const path = require("path");

const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");
const roleText = require("./roleText");

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

  playersWithRole[gameId] = [];

  players.forEach((player, index) => {
    const role = shuffledRoles[index];
    playersWithRole[gameId].push({ ...player, role });
  });
}

function revailRole(gameId) {
  const players = playersWithRole[gameId];

  if (players === undefined) {
    return;
  }

  players.forEach((player) => {
    const role = player.role;
    let additionalInfo = "";

    if (role === "President") {
      const fbiPlayer = players.find((player) => player.role === "FBI");

      if (fbiPlayer) {
        additionalInfo = "***** Your FBI is " + fbiPlayer.name + "*****";
      }
    } else if (role === "Collaborator") {
      const terroristPlayer = players.find(
        (player) => player.role === "Terrorist"
      );

      if (terroristPlayer) {
        additionalInfo =
          "***** The Terrorist is " + terroristPlayer.name + "*****";
      }
    }

    const roleInfo = {
      role,
      text: roleText[role].text + " " + additionalInfo,
      color: roleText[role].color,
    };

    io.to(player.id).emit("revail role", roleInfo);
  });

  const shuffledRoles = shuffleArray(roles.slice(0, players.length));

  if (playersWithRole[gameId] === undefined) {
    playersWithRole[gameId] = [];

    players.forEach((player, index) => {
      const role = shuffledRoles[index];
      playersWithRole[gameId].push({ ...player, role });
    });
  }
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

  socket.on("leave game", ({ gameId }) => {
    let game = games[gameId];

    if (game === undefined) {
      return;
    }

    const player = game.players.find((player) => player.id === socket.id);

    if (player === undefined) {
      return;
    }

    const wasAdmin = player.isAdmin;

    game.players = game.players.filter((player) => player.id !== socket.id);
    socket.leave(gameId);

    if (game.players.length === 0) {
      delete games[gameId];
    } else if (wasAdmin) {
      game.players[0].isAdmin = true;
    }

    socket.emit("left game");
    io.emit("list games", Object.values(games));
  });

  socket.on("distribute roles", ({ gameId }) => {
    if (!games[gameId]) {
      return;
    }

    const player = games[gameId].players.find(
      (player) => player.id === socket.id
    );
    if (!player.isAdmin) {
      return;
    }

    assignRoles(games[gameId].players, gameId);
    revailRole(gameId);
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
