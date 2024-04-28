import React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Button,
  Heading,
  SimpleGrid,
  Flex,
  Container,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import io from 'socket.io-client';

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const socket = socketUrl ? io(socketUrl) : io();

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [joinedGame, setJoinedGame] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [players, setPlayers] = useState([]);
  const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4'];

  // const handleJoinRoom = () => {
  //   if (name.trim() !== '' && selectedRoom === '') {
  //     socket.connect();
  //     socket.emit('join room', { name, room: selectedRoom });
  //   } else {
  //     alert('Please enter your name and select a room');
  //   }
  // };

  const handleCreateGame = () => {
    if (playerName.trim() === '' || gameName.trim() === '') {
      alert('Both fields are required');
      return;
    }
    socket.emit('create game', { playerName, gameName });
  };

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

    socket.on('list games', games => {
      console.log(games);
    });

    socket.on('game started', players => {
      setPlayers(players);
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
                  onClick={onOpen}
                  flex={true}
                >
                  Create Game
                </Button>
                {/* <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value.slice(0, 10))}
              ></Input> */}

                {/* {rooms.map(room => (
              <Button
                key={room}
                colorScheme="red"
                variant="solid"
                onClick={() => handleJoinRoom(room.id)}
                flex={true}
              >
                {room}
              </Button>
            ))} */}
              </SimpleGrid>
            </Box>
          )}
        </Container>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create your account</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Player name</FormLabel>
              <Input
                placeholder="Player name"
                value={playerName}
                onChange={e => setPlayerName(e.target.value.slice(0, 10))}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Game name</FormLabel>
              <Input
                placeholder="Game name"
                value={gameName}
                onChange={e => setGameName(e.target.value.slice(0, 10))}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleCreateGame}>
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default App;
