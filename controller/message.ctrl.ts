import { NextApiRequest, NextApiResponse } from 'next';
import BadRequestError from '@/controller/error/bad_request_error';
import MessageModel from '@/models/message/message.model';

const post = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, message, author } = req.body;

  if (!uid) throw new BadRequestError('uid 누락');
  if (!message) throw new BadRequestError('message 누락');

  await MessageModel.post({ uid, message, author });
  res.status(201).end();
};

const list = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, page, size } = req.query;
  if (!uid) throw new BadRequestError('uid 누락');

  const convertPage = page ?? '1';
  const convertSize = size || '10';

  const targetId = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  const messageList = await MessageModel.listWithPage({
    uid: targetId,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });
  res.status(200).json(messageList);
};

const get = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, messageId } = req.query;
  if (!uid) throw new BadRequestError('uid 누락');
  if (!messageId) throw new BadRequestError('messageId 누락');

  const targetId = Array.isArray(uid) ? uid[0] : uid;
  const targetMessageId = Array.isArray(messageId) ? messageId[0] : messageId;
  const messageList = await MessageModel.get({ uid: targetId, messageId: targetMessageId });
  res.status(200).json(messageList);
};

const postReply = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uid, messageId, reply } = req.body;

  if (!uid) throw new BadRequestError('uid 누락');
  if (!messageId) throw new BadRequestError('messageId 누락');
  if (!reply) throw new BadRequestError('reply 누락');

  await MessageModel.postReply({ uid, messageId, reply });
  res.status(201).end();
};

const MessageController = {
  post,
  list,
  get,
  postReply,
};

export default MessageController;
