import React, { useState } from 'react';
import { Avatar, Box, Button, Divider, Flex, Text, Textarea } from '@chakra-ui/react';
import TextareaAutosize from 'react-textarea-autosize';
import { InMessage } from '@/models/message/in_message';
import convertDateString from '@/utils/convert_date_string';

const DEFAULT_PHOTO = '/empty-avatar.svg';

interface Props {
  uid: string;
  displayName: string;

  photoURL: string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

function MessageItem({ uid, displayName, photoURL, isOwner, item, onSendComplete }: Props) {
  const hasReply = !!item.reply;
  const [reply, setReply] = useState('');

  const postReply = async () => {
    const result = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        messageId: item.id,
        reply,
      }),
    });
    if (result.status < 300) onSendComplete();
  };

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl={2} pt={2} alignItems="center">
          <Avatar size="xs" src={item?.author?.photoURL ?? DEFAULT_PHOTO} />
          <Text fontSize="xs" ml={1}>
            {item?.author?.displayName ?? 'Anonymous'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.500" ml={1}>
            {convertDateString(item.createAt)}
          </Text>
        </Flex>
      </Box>
      <Box p={2}>
        <Box borderRadius="md" borderWidth={1} p={2}>
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
        </Box>
        {hasReply && (
          <Box pt={2}>
            <Divider />
            <Box display="flex" mt={2}>
              <Box pt={2}>
                <Avatar size="xs" src={photoURL} mr={2} />
              </Box>
              <Box borderRadius="md" p={2} width="full" bg="gray.100">
                <Flex alignItems="center">
                  <Text fontSize="xs">{displayName}</Text>
                  <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                    {convertDateString(item.replyAt!)}
                  </Text>
                </Flex>
                <Text whiteSpace="pre-line" fontSize="xs">
                  {item.reply}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        {!hasReply && isOwner && (
          <Box pt={2}>
            <Divider />
            <Box display="flex" mt={2}>
              <Box pt={1}>
                <Avatar size="xs" src={photoURL} mr={2} />
              </Box>
              <Box borderRadius="md" width="full" bg="gray.100" mr={2}>
                <Textarea
                  as={TextareaAutosize}
                  boxShadow="none !important"
                  bg="gray.100"
                  border="none"
                  placeholder="댓글 입력"
                  resize="none"
                  overflow="hidden"
                  minH="unset"
                  fontSize="xs"
                  value={reply}
                  onChange={({ currentTarget: { value } }) => setReply(value)}
                />
              </Box>
              <Button
                colorScheme="pink"
                size="sm"
                variant="solid"
                bgColor="#ff75b5"
                disabled={!reply}
                onClick={postReply}
              >
                등록
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default MessageItem;
