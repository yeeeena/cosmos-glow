import { Box, Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { Home, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export function AppSidebar() {
  return (
    <Flex
      direction="column"
      align="center"
      w="64px"
      h="100vh"
      borderRight="1px solid"
      borderColor="brand.surface"
      bg="brand.bg"
      py={4}
      gap={1}
      flexShrink={0}
    >
      {/* Logo */}
      <Flex align="center" justify="center" w="40px" h="40px" mb={4}>
        <Box fontSize="xl">🧪</Box>
      </Flex>

      {/* Nav */}
      <Flex as="nav" direction="column" align="center" gap={1} flex={1}>
        <Tooltip label="홈" placement="right" hasArrow openDelay={200}>
          <Box>
            <NavLink
              to="/"
              end
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
              activeClassName="chakra-nav-active"
              style={({ isActive }: { isActive: boolean }) => ({
                color: isActive ? "#3b82f6" : "#6b6762",
                backgroundColor: isActive ? "rgba(59,130,246,0.1)" : "transparent",
              })}
            >
              <Home size={20} />
            </NavLink>
          </Box>
        </Tooltip>

        <Tooltip label="컨셉샷 생성" placement="right" hasArrow openDelay={200}>
          <Box>
            <NavLink
              to="/create"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
              activeClassName="chakra-nav-active"
              style={({ isActive }: { isActive: boolean }) => ({
                color: isActive ? "#3b82f6" : "#6b6762",
                backgroundColor: isActive ? "rgba(59,130,246,0.1)" : "transparent",
              })}
            >
              <Sparkles size={20} />
            </NavLink>
          </Box>
        </Tooltip>
      </Flex>
    </Flex>
  );
}
