import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Button, Flex, FormControl, FormLabel, Switch, Text, Textarea, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
import * as process from 'process';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';

const DEFAULT_PHOTO = '/empty-avatar.svg';
const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const toast = useToast();
  const { authUser } = useAuth();

  if (!userInfo) return <p>사용자를 찾을 수 없습니다.</p>;

  return (
    <ServiceLayout title="user home" minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? DEFAULT_PHOTO} mr={2} />
            <Flex direction="column" justify="center">
              <Text fontSize="md">{userInfo.displayName}</Text>
              <Text fontSize="md">{userInfo.email}</Text>
            </Flex>
          </Flex>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2">
          <Flex align="center" p={2}>
            <Avatar size="xs" src={isAnonymous ? DEFAULT_PHOTO : authUser?.photoURL ?? DEFAULT_PHOTO} mr={2} />
            <Textarea
              as={TextareaAutosize}
              bg="gray.100"
              border="none"
              placeholder="질문사항 입력"
              resize="none"
              overflow="hidden"
              minH="unset"
              fontSize="xs"
              mr="2"
              maxRows={7}
              value={message}
              onChange={({ currentTarget: { value } }) => {
                const lineCount = value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                if (lineCount >= 7) {
                  return toast({ title: '최대 7줄 까지만 입력 가능합니다.', position: 'top-right' });
                }
                setMessage(value);
              }}
            />
            <Button disabled={message.length === 0} bgColor="#FFBB6C" colorScheme="yellow" color="white">
              등록
            </Button>
          </Flex>

          <FormControl display="flex" alignItems="center" mt={1} pb={2} pl={2}>
            <Switch
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr={1}
              isChecked={isAnonymous}
              onChange={() => {
                if (!authUser) return toast({ title: '로그인이 필요합니다.' });
                setIsAnonymous(!isAnonymous);
              }}
            />
            <FormLabel htmlFor="anonymous" margin={0} fontSize="xx-small">
              Anonymous
            </FormLabel>
          </FormControl>
        </Box>
      </Box>
    </ServiceLayout>
  );
};

interface Props {
  userInfo: InAuthUser | null;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;
  if (!screenName) return { props: { userInfo: null } };

  try {
    const protocol = `${process.env.PROTOCOL}`;
    const host = `${process.env.HOST}`;
    const port = `${process.env.PORT}`;
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoRes: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    return { props: { userInfo: userInfoRes.data ?? null } };
  } catch (err) {
    console.error(err);
    return { props: { userInfo: null } };
  }
};

export default UserHomePage;
