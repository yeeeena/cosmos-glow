import { Box, Flex } from "@chakra-ui/react";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex minH="100vh" w="full" bg="brand.bg">
      <AppSidebar />
      <Box as="main" flex={1} display="flex" flexDirection="column" overflow="hidden">
        {children}
      </Box>
    </Flex>
  );
}
