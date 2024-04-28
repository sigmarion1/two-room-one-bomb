import React from 'react';
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Flex,
  Container,
  useDisclosure,
  Image,
  Text,
  Badge,
} from '@chakra-ui/react';
import Avatar, { genConfig } from 'react-nice-avatar';

const PlayerListItem = ({ player, index }) => {
  const config = genConfig(player.name);
  return (
    <Flex>
      <Avatar style={{ width: '3rem', height: '3rem' }} {...config} />
      <Box ml="3">
        <Text fontWeight="bold">
          {index + 1}. {player.name}
          {player.isAdmin && (
            <Badge ml="1" colorScheme="purple">
              Admin
            </Badge>
          )}
        </Text>
      </Box>
    </Flex>
  );
};

export default PlayerListItem;
