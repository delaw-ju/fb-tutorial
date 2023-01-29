import { NextApiRequest, NextApiResponse } from 'next';
import checkSupportMethod from '@/controller/error/check_support_method';
import handleError from '@/controller/error/handle_error';
import MessageController from '@/controller/message.ctrl';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const supportMethod = ['POST'];
  try {
    checkSupportMethod(supportMethod, method!);
    await MessageController.postReply(req, res);
  } catch (err) {
    handleError(err, res);
  }
};
