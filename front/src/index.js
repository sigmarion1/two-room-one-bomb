import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import theme from './theme'; // Import your custom theme

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
