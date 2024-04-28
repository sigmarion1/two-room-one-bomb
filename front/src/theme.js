// 1. Import extendTheme from Chakra UI
import { extendTheme } from '@chakra-ui/react';

// 2. Extend the theme to include custom config values
const theme = extendTheme({
  config: {
    initialColorMode: 'light', // Set to 'light' or 'dark' as needed
    useSystemColorMode: false, // Disable system color mode
  },
});

export default theme;
