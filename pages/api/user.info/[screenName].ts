import { NextApiRequest, NextApiResponse } from 'next';
import checkSupportMethod from '@/controller/error/check_support_method';
import MemberController from '@/controller/member.ctrl';
import handleError from '@/controller/error/handle_error';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['GET'];
  try {
    checkSupportMethod(supportMethod, method!);
    await MemberController.findByScreenName(req, res);
  } catch (err) {
    handleError(err, res);
  }
}
