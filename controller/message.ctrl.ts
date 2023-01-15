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

const MessageController = {
  post,
};

export default MessageController;
