import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Flex, Heading, Text, Link } from "@chakra-ui/react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.bg">
      <Flex direction="column" align="center" textAlign="center">
        <Heading size="2xl" mb={4} color="brand.accent">404</Heading>
        <Text fontSize="xl" mb={4} color="brand.muted">Oops! Page not found</Text>
        <Link href="/" color="blue.400" _hover={{ textDecoration: "underline" }}>
          Return to Home
        </Link>
      </Flex>
    </Flex>
  );
};

export default NotFound;
