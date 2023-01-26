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
  const { uid } = req.query;
  if (!uid) throw new BadRequestError('uid 누락');
  const targetId = Array.isArray(uid) ? uid[0] : uid;
  const messageList = await MessageModel.list({ uid: targetId });
  res.status(200).json(messageList);
};

const MessageController = {
  post,
  list,
};

export default MessageController;
