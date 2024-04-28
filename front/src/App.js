import React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Flex,
  Container,
  useDisclosure,
} from '@chakra-ui/react';
import io from 'socket.io-client';
import GameModal from './components/GameModal';

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

  const handleModalopen = (mode, gameId) => {
    if (mode === 'create') {
      setModalMode('create');
    } else if (mode === 'join') {
      setModalMode('join');
      setSelectedGameId(gameId);
    } else {
      return;
    }

    onOpen();
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      socket.emit('create game', { playerName, gameName });
    } else if (modalMode === 'join') {
      socket.emit('join game', { playerName, selectedGameId });
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
  }, []);

  return (
    <>
      <Flex minH="100vh" justify="center">
        <Container boxShadow={'xl'} p={10} rounded={'md'}>
          {joinedGame ? (
            <div>게임화면</div>
          ) : (
            <Box textAlign="center" fontSize="xl">
              <Heading mb={4}>Choose a Game</Heading>
              <SimpleGrid columns={1} spacing={5} padding={5}>
                <Button
                  colorScheme="red"
                  variant="solid"
                  onClick={() => handleModalopen('create')}
                  flex={true}
                >
                  Create Game
                </Button>
                {gameList.map(game => (
                  <Button
                    key={game.id}
                    colorScheme="red"
                    variant="solid"
                    onClick={() => handleModalopen('join', game.id)}
                    flex={true}
                  >
                    {game.name}
                  </Button>
                ))}
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
