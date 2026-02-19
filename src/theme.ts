import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      bg: "#1b1b1b",
      surface: "#252525",
      text: "#c5c1b9",
      accent: "#ffffff",
      muted: "#6b6762",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#1b1b1b",
        color: "#c5c1b9",
      },
    },
  },
  fonts: {
    heading: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    body: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
});

export default theme;
