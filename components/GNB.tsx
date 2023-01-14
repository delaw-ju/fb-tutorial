import React from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth_user.context';

function GNB() {
  const { loading, authUser, signOut, signInWithGoogle } = useAuth();

  const logOutButton = (
    <Button fontSize="sm" as="a" fontWeight={400} variant="link" onClick={signOut}>
      로그아웃
    </Button>
  );

  const loginButton = (
    <Button
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="pink.400"
      _hover={{ bg: 'pink.300' }}
      onClick={signInWithGoogle}
    >
      로그인
    </Button>
  );

  const authInitialized = loading || !authUser;

  return (
    <Box borderBottom={1} borderStyle="solid" borderColor="gray.500">
      <Flex minH="60px" py={{ base: 2 }} px={{ base: 4 }} align="center" justifyContent="space-between">
        <Box>
          <img style={{ height: '40px' }} src="/vercel.svg" />
        </Box>
        <Box>{authInitialized ? loginButton : logOutButton}</Box>
      </Flex>
    </Box>
  );
}

export default GNB;
