import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';

function GameModal({
  isOpen,
  onClose,
  playerName,
  setPlayerName,
  gameName,
  setGameName,
  modalMode,
  onSubmit,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {modalMode === 'create' ? 'Create Game' : 'Join Game'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Player Name</FormLabel>
            <Input
              placeholder="Player name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value.slice(0, 10))}
            />
          </FormControl>
          {modalMode === 'create' && (
            <FormControl mt={4}>
              <FormLabel>Game Name</FormLabel>
              <Input
                placeholder="Game name"
                value={gameName}
                onChange={e => setGameName(e.target.value.slice(0, 10))}
              />
            </FormControl>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={() => onSubmit()}>
            {modalMode === 'create' ? 'Create' : 'Join'}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default GameModal;
