import React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  SimpleGrid,
  Flex,
  Container,
  useDisclosure,
  Image,
} from '@chakra-ui/react';
import io from 'socket.io-client';
import GameModal from './components/GameModal';
import PlayerListItem from './components/PlayerListItem';

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const socket = socketUrl ? io(socketUrl) : io();

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [joinedGame, setJoinedGame] = useState(null);
  const [gameList, setGameList] = useState([]);

  const [modalMode, setModalMode] = useState('create');
  const [selectedGameId, setSelectedGameId] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleModalopen = (mode, gameId = null) => {
    setModalMode(mode);
    setSelectedGameId(gameId);

    onOpen();
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      socket.emit('create game', { playerName, gameName });
    } else if (modalMode === 'join') {
      socket.emit('join game', { playerName, gameId: selectedGameId });
    } else {
      return;
    }

    onClose();
  };

  useEffect(() => {
    console.log(gameList); // Now it logs the updated state whenever it changes
  }, [gameList]); // Dependency array, useEffect will run when gameList changes

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('join game', ({ gameId }) => {
      setJoinedGame(gameId);
    });

    socket.on('left game', () => {
      setJoinedGame(null);
    });

    socket.on('list games', receviedGames => {
      setGameList(receviedGames);
    });

    socket.on('game started', players => {
      // setPlayers(players);
    });

    socket.on('game info', gameInfo => {
      console.log(gameInfo);
    });

    socket.on('error', error => {
      alert(error);
    });
  }, []);

  const currentGame = gameList.find(game => game.id === joinedGame);
  const currentplayer = currentGame?.players.find(
    player => player.id === socket.id
  );

  return (
    <>
      <Flex minH="100vh" justify="center" bgColor={'red.600'}>
        <Container boxShadow={'xl'} p={4} rounded={'xl'} bgColor={'white'}>
          <Image src="/logo.png" alt="logo" />
          {currentGame && (
            <Box textAlign="center" fontSize="xl">
              <SimpleGrid columns={1} spacing={4} padding={5}>
                <Container
                  bgColor="white"
                  rounded={'5px'}
                  border={'2px'}
                  borderColor={'red.600'}
                  textColor={'red.600'}
                  p="2px"
                >
                  {currentGame.name}
                </Container>

                {currentGame.players.map((player, i) => (
                  <PlayerListItem player={player} key={player.id} index={i} />
                ))}
                {currentplayer?.isAdmin && (
                  <Button variant="solid" colorScheme="red" flex={true}>
                    Start Game
                  </Button>
                )}

                {!currentplayer?.isAdmin && (
                  <Button
                    isLoading
                    variant="solid"
                    colorScheme="red"
                    flex={true}
                    loadingText="Waiting for players..."
                  ></Button>
                )}

                <Button
                  variant="solid"
                  flex={true}
                  onClick={() =>
                    socket.emit('leave game', { gameId: joinedGame })
                  }
                >
                  Leave Game
                </Button>
              </SimpleGrid>
            </Box>
          )}

          {!joinedGame && (
            <Box textAlign="center" fontSize="xl">
              <SimpleGrid columns={1} spacing={4} padding={5}>
                {gameList.map(game => (
                  <Button
                    key={game.id}
                    variant="solid"
                    onClick={() => handleModalopen('join', game.id)}
                    flex={true}
                  >
                    {game.name} - [{game.players.length}/24]
                  </Button>
                ))}
                <Button
                  colorScheme="red"
                  variant="solid"
                  onClick={() => handleModalopen('create')}
                  flex={true}
                >
                  Create Game
                </Button>
              </SimpleGrid>

              <GameModal
                isOpen={isOpen}
                onClose={onClose}
                modalMode={modalMode}
                playerName={playerName}
                setPlayerName={setPlayerName}
                gameName={gameName}
                setGameName={setGameName}
                onSubmit={handleSubmit}
              />
            </Box>
          )}
        </Container>
      </Flex>
    </>
  );
}

export default App;
