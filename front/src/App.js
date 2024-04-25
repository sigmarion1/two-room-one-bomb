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
} from '@chakra-ui/react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [name, setName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [players, setPlayers] = useState([]);
  const rooms = ['Room 1', 'Room 2', 'Room 3', 'Room 4'];

  const handleJoinRoom = () => {
    if (name.trim() !== '' && selectedRoom === '') {
      socket.connect();
      socket.emit('join room', { name, room: selectedRoom });
    } else {
      alert('Please enter your name and select a room');
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('game started', players => {
      setPlayers(players);
    });
  }, []);

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container boxShadow={'xl'} p={10} rounded={'md'}>
        <Box textAlign="center" fontSize="xl">
          <Heading mb={4}>Choose a Game Room</Heading>
          <SimpleGrid columns={1} spacing={5} padding={5}>
            {rooms.map(room => (
              <Button
                key={room}
                colorScheme="red"
                variant="solid"
                onClick={() => handleJoinRoom(room)}
                flex={true}
              >
                {room}
              </Button>
            ))}

            <Input
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 10))}
              alignContent={'center'}
            ></Input>
          </SimpleGrid>
        </Box>
      </Container>
    </Flex>
  );
}

export default App;
