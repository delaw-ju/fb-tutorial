import { GetServerSideProps, NextPage } from 'next';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
import * as process from 'process';
import { TriangleDownIcon } from '@chakra-ui/icons';
import { useQuery } from 'react-query';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

const DEFAULT_PHOTO = '/empty-avatar.svg';

const postMessage = async ({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL: string;
  };
}) => {
  if (message.length < 1) return { result: false, message: '메세지를 입력 해 주세요.' };
  try {
    await fetch('/api/messages.add', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid, message, author }),
    });
    return { result: true };
  } catch (err) {
    console.error(err);
    return { result: false, message: '메세지 등록 실패' };
  }
};

const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState(false);
  const toast = useToast();
  const { authUser } = useAuth();

  const fetchMessage = async ({ uid, messageId }: { uid: string; messageId: string }) => {
    const res = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
    if (res.status === 200) {
      const updatedMessage: InMessage = await res.json();
      setMessageList((prev) => prev.map((pm) => (pm.id === updatedMessage.id ? updatedMessage : pm)));
    }
  };

  const submitHandler = async () => {
    const postData: {
      uid: string;
      message: string;
      author?: { displayName: string; photoURL: string };
    } = { uid: userInfo?.uid || '', message };
    const author = isAnonymous
      ? undefined
      : {
          displayName: authUser?.displayName ?? 'anonymous',
          photoURL: authUser?.photoURL ?? DEFAULT_PHOTO,
        };
    if (!isAnonymous) postData.author = author;

    const { result } = await postMessage(postData);
    if (!result) return toast({ title: '메세지 등록 실패.' });
    setMessage('');
    setPage(1);
    setTimeout(() => setMessageListFetchTrigger((prev) => !prev), 50);
  };

  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];
  useQuery(
    messageListQueryKey,
    async () =>
      await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        contents: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: ({ data }) => {
        setTotalPages(data.totalPages);
        const isFirstPage = data.page === 1;
        setMessageList((prev) => (isFirstPage ? [...data.contents] : [...prev, ...data.contents]));
      },
    },
  );
  if (!userInfo) return <p>사용자를 찾을 수 없습니다.</p>;
  return (
    <ServiceLayout title={`${authUser?.displayName}'s home`} minH="100vh" backgroundColor="gray.50">
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
            <Button
              onClick={submitHandler}
              disabled={message.length === 0}
              bgColor="#FFBB6C"
              colorScheme="yellow"
              color="white"
            >
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
                setIsAnonymous((prev) => !prev);
              }}
            />
            <FormLabel htmlFor="anonymous" margin={0} fontSize="xx-small">
              Anonymous
            </FormLabel>
          </FormControl>
        </Box>
        <VStack spacing={3} mt={6}>
          {messageList.map((_message) => (
            <MessageItem
              key={`message-${_message.id}`}
              uid={userInfo.uid ?? ''}
              displayName={userInfo.displayName ?? ''}
              photoURL={userInfo.displayName ?? DEFAULT_PHOTO}
              isOwner={authUser?.uid === userInfo?.uid}
              item={_message}
              onSendComplete={() => fetchMessage({ uid: userInfo?.uid, messageId: _message.id })}
            />
          ))}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt={2}
            fontSize="sm"
            leftIcon={<TriangleDownIcon />}
            onClick={() => setPage((prev) => prev + 1)}
          >
            더보기
          </Button>
        )}
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
