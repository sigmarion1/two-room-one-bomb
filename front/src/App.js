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
  keyframes,
} from '@chakra-ui/react';
import io from 'socket.io-client';
import GameModal from './components/GameModal';
import PlayerListItem from './components/PlayerListItem';

const socketUrl = process.env.REACT_APP_SOCKET_URL;
const socket = socketUrl ? io(socketUrl) : io();
const slideshow = keyframes`  
  from {background-position: 0 0;}   
  to {background-position: -10000px -6000px;}
`;
const slideShowAnimation = `${slideshow} infinite 360s linear`;

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [joinedGame, setJoinedGame] = useState(null);
  const [gameList, setGameList] = useState([]);

  const [modalMode, setModalMode] = useState('create');
  const [selectedGameId, setSelectedGameId] = useState(null);

  const [myRole, setMyRole] = useState(null);

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
      setMyRole(null);
    });

    socket.on('list games', receviedGames => {
      setGameList(receviedGames);
    });

    socket.on('revail role', roleInfo => {
      setMyRole(roleInfo);
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
      <Flex
        minH="100vh"
        justify="center"
        bgColor={'red.600'}
        bgImage={`radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.5) 0.1rem,
          transparent 0
        )`}
        bgSize={'0.8rem 0.8rem'}
        p={'1rem'}
        py={'3rem'}
        animation={slideShowAnimation}
      >
        <Container
          boxShadow={'xl'}
          p={2}
          rounded={'xl'}
          bgColor={'white'}
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
        >
          <Image src="/logo.png" alt="logo" />
          {currentGame && (
            <Box textAlign="center" fontSize="xl">
              <SimpleGrid columns={1} spacing={4} padding={5}>
                <Container
                  bgColor="red.600"
                  rounded={'5px'}
                  border={'2px'}
                  borderColor={'red.600'}
                  textColor={'white'}
                  p="2px"
                >
                  {currentGame.name}
                </Container>

                {currentGame.players.map((player, i) => (
                  <PlayerListItem player={player} key={player.id} index={i} />
                ))}
                {myRole && (
                  <>
                    <Container
                      rounded={'5px'}
                      border={'2px'}
                      borderColor={'red.600'}
                      p="2px"
                      minH="500px"
                      textAlign={'center'}
                    >
                      <b>CAUTION</b> <br /> Do not share this information with
                      other players
                    </Container>
                    <Container
                      bgColor={
                        myRole.color === 'grey'
                          ? 'black'
                          : myRole.color + '.600'
                      }
                      rounded={'5px'}
                      textColor={'white'}
                      p="2px"
                    >
                      Your Role: {myRole.role}
                    </Container>
                    <Box textAlign="center">
                      <Image
                        display={'inline-block'}
                        src={'/' + myRole.role.toLowerCase() + '.png'}
                        alt={myRole.role}
                        objectFit="cover"
                        borderRadius="full"
                      />
                    </Box>
                    <Container
                      bgColor={
                        myRole.color === 'grey'
                          ? 'black'
                          : myRole.color + '.600'
                      }
                      rounded={'5px'}
                      textColor={'white'}
                      p="2px"
                    >
                      {myRole.text}
                    </Container>
                  </>
                )}

                {currentplayer?.isAdmin && (
                  <Button
                    variant="solid"
                    colorScheme="red"
                    flex={true}
                    onClick={() =>
                      socket.emit('distribute roles', { gameId: joinedGame })
                    }
                  >
                    Distribute Roles
                  </Button>
                )}
                {/* 
                {currentplayer?.isAdmin && (
                  <Button variant="solid" colorScheme="red" flex={true}>
                    View Roles (Open for All Players)
                  </Button>
                )} */}

                {!currentplayer?.isAdmin && !myRole && (
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
